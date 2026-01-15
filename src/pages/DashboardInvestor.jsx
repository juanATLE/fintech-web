import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/5 p-6 ${className}`}>
      {children}
    </div>
  );
}

function Pill({ children, tone = "gray" }) {
  const cls =
    tone === "green"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
      : tone === "red"
      ? "border-red-400/25 bg-red-500/10 text-red-200"
      : tone === "yellow"
      ? "border-yellow-400/25 bg-yellow-500/10 text-yellow-200"
      : tone === "blue"
      ? "border-sky-400/25 bg-sky-500/10 text-sky-200"
      : "border-white/10 bg-white/5 text-white/70";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}>
      {children}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "-";
  }
}

export default function DashboardInvestor() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [myListings, setMyListings] = useState([]);
  const [myDocs, setMyDocs] = useState([]);

  const load = async () => {
    setMsg("");
    setLoading(true);

    const r = await getMyRole();
    setRole(r);

    if (r !== "investor") {
      navigate("/select-role?setup=1", { replace: true });
      return;
    }

    const { data: u } = await supabase.auth.getUser();
    setEmail(u?.user?.email ?? "");

    const userId = u?.user?.id;
    if (!userId) {
      setMsg("No hay sesión activa.");
      setLoading(false);
      return;
    }

    // 1) Mis publicaciones
    const { data: listings, error: listErr } = await supabase
      .from("vehicle_listings")
      .select(
        `
        id,
        vehicle_id,
        investor_user_id,
        status,
        base_amount,
        base_term_months,
        base_installment,
        allow_counteroffers,
        created_at,
        auction_starts_at,
        auction_ends_at,
        vehiculos:vehicle_id (
          id, marca, modelo, anio, placa
        )
      `
      )
      .eq("investor_user_id", userId)
      .order("created_at", { ascending: false });

    if (listErr) {
      setMsg("No se pudieron cargar tus publicaciones: " + listErr.message);
      setMyListings([]);
    } else {
      setMyListings(listings ?? []);
    }

    // 2) Mis documentos subidos
    const { data: docs, error: docsErr } = await supabase
      .from("vehicle_documents")
      .select(
        `
        id,
        vehicle_id,
        doc_type,
        status,
        admin_notes,
        created_at
      `
      )
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false });

    if (!docsErr) setMyDocs(docs ?? []);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // ====== Reglas MVP ======
  // Solo pedimos:
  // - tarjeta_propiedad
  // - foto_vehiculo
  // Hasta que ambas estén approved => listing active
  const REQUIRED_DOCS = ["tarjeta_propiedad", "foto_vehiculo"];

  const docsByVehicle = useMemo(() => {
    const map = {};
    for (const d of myDocs) {
      if (!map[d.vehicle_id]) map[d.vehicle_id] = [];
      map[d.vehicle_id].push(d);
    }
    return map;
  }, [myDocs]);

  const getDocsSummary = (vehicleId) => {
    const docs = docsByVehicle[vehicleId] ?? [];

    const status = {};
    for (const d of docs) status[d.doc_type] = d.status;

    const missing = REQUIRED_DOCS.filter((k) => !status[k]);
    const rejected = docs.find((x) => x.status === "rejected");

    if (rejected) {
      return { kind: "rejected", label: "Documentos rechazados", note: rejected.admin_notes ?? "" };
    }

    const ok = REQUIRED_DOCS.every((k) => status[k] === "approved");
    if (ok) return { kind: "approved", label: "Documentos aprobados", note: "" };

    if (missing.length > 0) return { kind: "missing", label: "Faltan documentos", note: "" };

    return { kind: "pending", label: "En validación", note: "" };
  };

  const statusPill = (listing, docsSummary) => {
    if (listing.status === "active") return <Pill tone="green">En subasta</Pill>;
    if (listing.status === "paused") return <Pill tone="gray">Pausado</Pill>;

    // Si todavía no está active: depende de docs
    if (docsSummary.kind === "rejected") return <Pill tone="red">Rechazado</Pill>;
    if (docsSummary.kind === "missing") return <Pill tone="yellow">Faltan documentos</Pill>;
    return <Pill tone="blue">Validación</Pill>;
  };

  const pendingListings = useMemo(() => {
    // publicaciones no activas
    return myListings.filter((x) => x.status !== "active");
  }, [myListings]);

  const activeListings = useMemo(() => {
    return myListings.filter((x) => x.status === "active");
  }, [myListings]);

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
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard Inversionista</h1>
            <p className="mt-2 text-white/60">
              Gestiona publicaciones, sube documentos y activa subastas.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/publish")}
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition"
            >
              Publicar vehículo
            </button>
            <button
              onClick={() => navigate("/vehicles")}
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Ver marketplace
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {msg}
          </div>
        )}

        {/* Resumen rápido */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-xs text-white/60">Cuenta</p>
            <p className="mt-1 text-sm text-white">{email}</p>
          </Card>

          <Card>
            <p className="text-xs text-white/60">Subastas activas</p>
            <p className="mt-1 text-2xl font-semibold">{activeListings.length}</p>
          </Card>

          <Card>
            <p className="text-xs text-white/60">Pendientes</p>
            <p className="mt-1 text-2xl font-semibold">{pendingListings.length}</p>
          </Card>

          <Card>
            <p className="text-xs text-white/60">Acción</p>
            <button
              onClick={load}
              className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              Actualizar panel
            </button>
          </Card>
        </div>

        {/* Publicaciones pendientes */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Publicaciones pendientes</h2>
          <p className="mt-2 text-sm text-white/60">
            Estas publicaciones aún requieren validación o documentos.
          </p>

          {pendingListings.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
              No tienes publicaciones pendientes.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {pendingListings.map((x) => {
                const docsSummary = getDocsSummary(x.vehicle_id);

                return (
                  <Card key={x.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs text-white/60">Vehículo</p>
                        <p className="mt-1 text-lg font-semibold">
                          {x.vehiculos?.marca} {x.vehiculos?.modelo} ({x.vehiculos?.anio})
                        </p>
                        <p className="mt-1 text-xs text-white/50">
                          {x.vehiculos?.placa ? `Placa: ${x.vehiculos.placa}` : "Sin placa"}
                        </p>
                      </div>
                      {statusPill(x, docsSummary)}
                    </div>

                    <div className="mt-4 text-sm text-white/70 space-y-1">
                      <p>Monto: <b>S/ {x.base_amount}</b></p>
                      <p>Plazo: <b>{x.base_term_months} meses</b></p>
                      <p>Cuota: <b>S/ {x.base_installment}</b></p>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                      Estado docs: <b className="text-white">{docsSummary.label}</b>
                      {docsSummary.note ? (
                        <p className="mt-2 text-xs text-red-200/80">
                          Nota del admin: {docsSummary.note}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <button
                        onClick={() => navigate(`/publish/docs/${x.vehicle_id}`)}
                        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                      >
                        Subir / Ver docs
                      </button>

                      <button
                        onClick={() => navigate(`/vehicles/${x.id}`)}
                        className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition"
                      >
                        Ver publicación
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Subastas activas */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold">Subastas activas</h2>
          <p className="mt-2 text-sm text-white/60">
            Estas publicaciones ya están visibles en el marketplace.
          </p>

          {activeListings.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
              Aún no tienes subastas activas.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {activeListings.map((x) => (
                <Card key={x.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/60">Vehículo</p>
                      <p className="mt-1 text-lg font-semibold">
                        {x.vehiculos?.marca} {x.vehiculos?.modelo} ({x.vehiculos?.anio})
                      </p>
                      <p className="mt-1 text-xs text-white/50">
                        {x.vehiculos?.placa ? `Placa: ${x.vehiculos.placa}` : "Sin placa"}
                      </p>
                    </div>
                    <Pill tone="green">En subasta</Pill>
                  </div>

                  <div className="mt-4 text-sm text-white/70 space-y-1">
                    <p>Inicio: <b>{formatDate(x.auction_starts_at)}</b></p>
                    <p>Fin: <b>{formatDate(x.auction_ends_at)}</b></p>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <Link
                      to="/vehicles"
                      className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-center hover:bg-white/10 transition"
                    >
                      Ir al marketplace
                    </Link>

                    <button
                      onClick={() => navigate(`/vehicles/${x.id}`)}
                      className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                    >
                      Ver publicación
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <p className="mt-12 text-xs text-white/40">
          MVP: si el admin aprueba tarjeta de propiedad + foto del vehículo, se activa automáticamente la subasta por 7 días.
        </p>
      </div>
    </div>
  );
}
