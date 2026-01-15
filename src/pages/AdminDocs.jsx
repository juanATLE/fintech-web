import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyRole } from "../supabase/db";

function Pill({ children, tone = "gray" }) {
  const cls =
    tone === "green"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
      : tone === "red"
      ? "border-red-400/25 bg-red-500/10 text-red-200"
      : tone === "yellow"
      ? "border-yellow-400/25 bg-yellow-500/10 text-yellow-200"
      : "border-white/10 bg-white/5 text-white/70";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}
    >
      {children}
    </span>
  );
}

export default function AdminDocs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdFilter = searchParams.get("vehicleId");

  const [role, setRole] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("pending"); // pending | all

  const filteredDocs = useMemo(() => {
    let list = docs;

    if (vehicleIdFilter) {
      list = list.filter((d) => d.vehicle_id === vehicleIdFilter);
    }

    if (filter === "pending") {
      list = list.filter((d) => d.status === "pending");
    }

    return list;
  }, [docs, filter, vehicleIdFilter]);

  const load = async () => {
    setMsg("");
    setLoading(true);

    const r = await getMyRole();
    setRole(r);

    if (r !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    let q = supabase
      .from("vehicle_documents")
      .select(
        `
        id,
        vehicle_id,
        doc_type,
        file_path,
        status,
        admin_notes,
        validated_by,
        validated_at,
        created_at,
        owner_user_id
      `
      )
      .order("created_at", { ascending: false });

    // 🔥 filtro directo desde BD si viene vehicleId
    if (vehicleIdFilter) q = q.eq("vehicle_id", vehicleIdFilter);

    const { data, error } = await q;

    if (error) {
      setMsg("No se pudo cargar documentos: " + error.message);
      setDocs([]);
    } else {
      setDocs(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [vehicleIdFilter]);

  const getDocLabel = (type) => {
    if (type === "tarjeta_propiedad") return "Tarjeta de propiedad";
    if (type === "foto_vehiculo") return "Foto del vehículo";
    if (type === "soat") return "SOAT";
    if (type === "revision_tecnica") return "Revisión técnica";
    return type;
  };

  const getStatusPill = (status) => {
    if (status === "approved") return <Pill tone="green">Aprobado</Pill>;
    if (status === "rejected") return <Pill tone="red">Rechazado</Pill>;
    return <Pill tone="yellow">Pendiente</Pill>;
  };

  // ✅ Abrir documento con Signed URL
  const openDoc = async (file_path) => {
    setMsg("");

    const { data, error } = await supabase.storage
      .from("vehicle-docs") // ✅ tu bucket real
      .createSignedUrl(file_path, 60);

    if (error) {
      setMsg("No se pudo abrir el documento: " + error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  // ✅ Activar subasta en vehicle_listings (status active + fechas 7 días)
  const activateAuction = async (vehicleId) => {
    const now = new Date();
    const ends = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("vehicle_listings")
      .update({
        status: "active",
        auction_starts_at: now.toISOString(),
        auction_ends_at: ends.toISOString(),
      })
      .eq("vehicle_id", vehicleId);

    if (error) {
      setMsg("Documentos aprobados, pero no se pudo activar la subasta: " + error.message);
      return false;
    }

    return true;
  };

  // ✅ Solo exigimos 2 documentos
  const tryActivateVehicle = async (vehicleId) => {
    const { data: docsVehicle, error } = await supabase
      .from("vehicle_documents")
      .select("doc_type,status")
      .eq("vehicle_id", vehicleId);

    if (error) return;

    const required = ["tarjeta_propiedad", "foto_vehiculo"];
    const statusMap = {};

    for (const d of docsVehicle ?? []) {
      statusMap[d.doc_type] = d.status;
    }

    const ok = required.every((k) => statusMap[k] === "approved");
    if (!ok) return;

    // ✅ si ambos aprobados => activar subasta
    const activated = await activateAuction(vehicleId);
    if (activated) setMsg("Documentos aprobados. Subasta activada por 7 días.");
  };

  const setStatus = async (docId, vehicleId, newStatus) => {
    setBusyId(docId);
    setMsg("");

    const note =
      newStatus === "rejected"
        ? window.prompt("Motivo del rechazo (recomendado)")
        : window.prompt("Nota del administrador (opcional)");

    const { data: userData } = await supabase.auth.getUser();
    const adminId = userData?.user?.id;

    if (!adminId) {
      setMsg("No hay sesión de administrador activa.");
      setBusyId(null);
      return;
    }

    const { error } = await supabase
      .from("vehicle_documents")
      .update({
        status: newStatus,
        admin_notes: note ?? null,
        validated_by: adminId,
        validated_at: new Date().toISOString(),
      })
      .eq("id", docId);

    if (error) {
      setMsg("No se pudo actualizar el documento: " + error.message);
      setBusyId(null);
      return;
    }

    // ✅ intento activar subasta si ya están aprobados ambos
    await tryActivateVehicle(vehicleId);

    await load();
    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-white">
        <Navbar />
        <div className="mx-auto max-w-6xl p-8 text-white/70">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Administrador - Documentos</h1>
            <p className="mt-2 text-white/60">
              Revisión y validación de documentos.
              {vehicleIdFilter ? (
                <>
                  <br />
                  Vehículo filtrado:{" "}
                  <span className="text-white/90 font-semibold">{vehicleIdFilter}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("pending")}
              className={`rounded-2xl px-4 py-2 text-sm border transition ${
                filter === "pending"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Pendientes
            </button>

            <button
              onClick={() => setFilter("all")}
              className={`rounded-2xl px-4 py-2 text-sm border transition ${
                filter === "all"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                  : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Volver al panel
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {msg}
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {filteredDocs.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
              No hay documentos para mostrar.
            </div>
          ) : (
            filteredDocs.map((d) => (
              <div
                key={d.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs text-white/60">Vehículo</p>
                    <p className="mt-1 font-semibold text-white">{d.vehicle_id}</p>

                    <p className="mt-1 text-sm text-white/70">
                      Documento: <b>{getDocLabel(d.doc_type)}</b>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusPill(d.status)}
                    <button
                      onClick={() => openDoc(d.file_path)}
                      className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Ver archivo
                    </button>
                  </div>
                </div>

                {d.admin_notes && (
                  <p className="mt-4 text-sm text-white/60">
                    Nota admin: <span className="text-white/80">{d.admin_notes}</span>
                  </p>
                )}

                {d.status === "pending" && (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <button
                      disabled={busyId === d.id}
                      onClick={() => setStatus(d.id, d.vehicle_id, "approved")}
                      className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
                    >
                      {busyId === d.id ? "Procesando..." : "Aprobar"}
                    </button>

                    <button
                      disabled={busyId === d.id}
                      onClick={() => setStatus(d.id, d.vehicle_id, "rejected")}
                      className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
                    >
                      {busyId === d.id ? "Procesando..." : "Rechazar"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <p className="mt-10 text-xs text-white/40">
          Regla MVP: tarjeta de propiedad + foto aprobadas activan subasta automáticamente (7 días).
        </p>
      </div>
    </div>
  );
}
