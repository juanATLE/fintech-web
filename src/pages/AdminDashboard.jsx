import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

function Card({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs text-white/60">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {subtitle && <p className="mt-2 text-sm text-white/60">{subtitle}</p>}
    </div>
  );
}

function StatusPill({ status }) {
  const base = "inline-flex rounded-full border px-3 py-1 text-xs";
  if (status === "active")
    return (
      <span className={`${base} border-emerald-400/25 bg-emerald-500/10 text-emerald-200`}>
        Activo
      </span>
    );
  if (status === "paused")
    return (
      <span className={`${base} border-yellow-400/25 bg-yellow-500/10 text-yellow-200`}>
        Pausado
      </span>
    );
  return (
    <span className={`${base} border-white/10 bg-white/5 text-white/70`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [docs, setDocs] = useState([]);

  const load = async () => {
    setMsg("");
    setLoading(true);

    const r = await getMyRole();
    setRole(r);

    if (r !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    // 1) Traer vehículos listados
    const { data: listings, error: lErr } = await supabase
      .from("vehicle_listings")
      .select(
        `
        id,
        vehicle_id,
        investor_user_id,
        status,
        created_at,
        auction_starts_at,
        auction_ends_at,
        vehiculos:vehicle_id (
          id, placa, marca, modelo, anio
        )
      `
      )
      .order("created_at", { ascending: false });

    if (lErr) {
      setMsg("No se pudo cargar publicaciones: " + lErr.message);
      setVehicles([]);
      setLoading(false);
      return;
    }

    setVehicles(listings ?? []);

    // 2) Traer docs
    const { data: dData, error: dErr } = await supabase
      .from("vehicle_documents")
      .select("vehicle_id, doc_type, status")
      .order("created_at", { ascending: false });

    if (dErr) {
      setMsg("No se pudo cargar documentos: " + dErr.message);
      setDocs([]);
    } else {
      setDocs(dData ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Construir mapa vehicleId -> estado docs
  const docsMap = useMemo(() => {
    const map = new Map();
    for (const d of docs) {
      if (!map.has(d.vehicle_id)) map.set(d.vehicle_id, {});
      map.get(d.vehicle_id)[d.doc_type] = d.status;
    }
    return map;
  }, [docs]);

  const getDocStatus = (vehicleId, docType) => {
    const m = docsMap.get(vehicleId) || {};
    return m[docType] || "missing";
  };

  const isReady = (vehicleId) => {
    const needed = ["tarjeta_propiedad", "foto_vehiculo"];
    return needed.every((k) => getDocStatus(vehicleId, k) === "approved");
  };

  const isPending = (vehicleId) => {
    const needed = ["tarjeta_propiedad", "foto_vehiculo"];
    return needed.some((k) => {
      const s = getDocStatus(vehicleId, k);
      return s === "pending" || s === "missing";
    });
  };

  const stats = useMemo(() => {
    const total = vehicles.length;
    const pendientes = vehicles.filter((v) => isPending(v.vehicle_id)).length;
    const listos = vehicles.filter((v) => isReady(v.vehicle_id)).length;
    const activos = vehicles.filter((v) => v.status === "active").length;
    return { total, pendientes, listos, activos };
  }, [vehicles, docsMap]);

  const activateAuction = async (listingId) => {
    setMsg("");

    // activar status active y setear fechas 7 días
    const now = new Date().toISOString();
    const ends = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("vehicle_listings")
      .update({
        status: "active",
        auction_starts_at: now,
        auction_ends_at: ends,
      })
      .eq("id", listingId);

    if (error) {
      setMsg("No se pudo activar la subasta: " + error.message);
      return;
    }

    setMsg("Subasta activada correctamente.");
    await load();
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
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Administrador</h1>
            <p className="mt-2 text-white/60">
              Panel de revisión: documentos + activación de subastas.
            </p>
          </div>

          <Link
            to="/admin/docs"
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
          >
            Ir a documentos
          </Link>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {msg}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card title="Publicaciones" value={stats.total} />
          <Card title="Pendientes docs" value={stats.pendientes} />
          <Card title="Listos para activar" value={stats.listos} />
          <Card title="Activos (subasta)" value={stats.activos} />
        </div>

        {/* Tabla */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Vehículos publicados</h2>
          <p className="mt-2 text-sm text-white/60">
            Para activar una subasta, se requiere: tarjeta de propiedad + foto aprobadas.
          </p>

          <div className="mt-6 grid gap-4">
            {vehicles.map((v) => {
              const vehicleId = v.vehicle_id;
              const tarjeta = getDocStatus(vehicleId, "tarjeta_propiedad");
              const foto = getDocStatus(vehicleId, "foto_vehiculo");

              return (
                <div
                  key={v.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs text-white/60">Vehículo</p>
                      <p className="mt-1 text-lg font-semibold">
                        {v.vehiculos?.marca} {v.vehiculos?.modelo} ({v.vehiculos?.anio})
                      </p>
                      <p className="mt-1 text-sm text-white/60">
                        {v.vehiculos?.placa ? `Placa: ${v.vehiculos.placa}` : "Sin placa"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <StatusPill status={v.status} />
                      <span className="text-xs text-white/60">
                        Tarjeta: <b className="text-white/80">{tarjeta}</b>
                      </span>
                      <span className="text-xs text-white/60">
                        Foto: <b className="text-white/80">{foto}</b>
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row">
                    <button
                      onClick={() => navigate(`/admin/docs?vehicleId=${vehicleId}`)}
                      className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Revisar documentos
                    </button>

                    {isReady(vehicleId) ? (
                      <button
                        onClick={() => activateAuction(v.id)}
                        className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                      >
                        Activar subasta (7 días)
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40"
                      >
                        Falta aprobación de documentos
                      </button>
                    )}
                  </div>

                  {v.auction_starts_at && v.auction_ends_at && (
                    <p className="mt-4 text-xs text-white/50">
                      Subasta: {new Date(v.auction_starts_at).toLocaleString()} →{" "}
                      {new Date(v.auction_ends_at).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-10 text-xs text-white/40">
          Chronos MVP · Admin valida documentos y activa subastas.
        </p>
      </div>
    </div>
  );
}
