import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm text-white/70">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-500/10 transition"
    />
  );
}

function Pill({ tone = "gray", children }) {
  const cls =
    tone === "green"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
      : tone === "red"
      ? "border-red-400/25 bg-red-500/10 text-red-200"
      : tone === "yellow"
      ? "border-yellow-400/25 bg-yellow-500/10 text-yellow-200"
      : "border-white/10 bg-white/5 text-white/70";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${cls}`}>
      {children}
    </span>
  );
}

const DOCS_REQUIRED = ["tarjeta_propiedad", "foto_vehiculo"];

export default function PublishCar() {
  const navigate = useNavigate();

  // --- Vehículo ---
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear() - 1);

  // --- Condiciones financieras ---
  const [baseAmount, setBaseAmount] = useState(25000);
  const [termMonths, setTermMonths] = useState(24);
  const [installment, setInstallment] = useState(1200);
  const [allowCounteroffers, setAllowCounteroffers] = useState(true);

  // --- UI ---
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const estimatedTotal = useMemo(() => {
    const total = Number(installment || 0) * Number(termMonths || 0);
    return isFinite(total) ? total.toFixed(2) : "0.00";
  }, [installment, termMonths]);

  // =======================
  //  Fetch publicaciones + docs
  // =======================
  const fetchMyListings = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    // 1) listings
    const { data: listings, error: listErr } = await supabase
      .from("vehicle_listings")
      .select(
        `
          id,
          status,
          base_amount,
          base_term_months,
          base_installment,
          allow_counteroffers,
          created_at,
          vehicle_id,
          vehiculos:vehicle_id (
            id, placa, marca, modelo, anio
          )
        `
      )
      .eq("investor_user_id", userId)
      .order("created_at", { ascending: false });

    if (listErr) {
      console.error(listErr);
      setMyListings([]);
      return;
    }

    const vehicleIds = (listings ?? []).map((x) => x.vehicle_id).filter(Boolean);

    // 2) docs para esos vehículos
    let docsMap = {};
    if (vehicleIds.length > 0) {
      const { data: docs, error: docsErr } = await supabase
        .from("vehicle_documents")
        .select("vehicle_id, doc_type, status")
        .in("vehicle_id", vehicleIds);

      if (!docsErr) {
        docsMap = (docs ?? []).reduce((acc, d) => {
          if (!acc[d.vehicle_id]) acc[d.vehicle_id] = {};
          acc[d.vehicle_id][d.doc_type] = d.status;
          return acc;
        }, {});
      }
    }

    const enhanced = (listings ?? []).map((x) => {
      const docStatus = docsMap[x.vehicle_id] || {};
      return { ...x, docStatus };
    });

    setMyListings(enhanced);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);

      const r = await getMyRole();
      setRole(r);

      if (r !== "investor") {
        navigate("/dashboard/entrepreneur", { replace: true });
        return;
      }

      await fetchMyListings();
      setLoading(false);
    })();
  }, [navigate]);

  // =======================
  //  UI helpers docs
  // =======================
  const docsState = (listing) => {
    // Requeridos:
    const map = listing.docStatus || {};

    const exists = DOCS_REQUIRED.every((k) => map[k]);
    const approved = DOCS_REQUIRED.every((k) => map[k] === "approved");
    const rejected = DOCS_REQUIRED.some((k) => map[k] === "rejected");
    const pending = DOCS_REQUIRED.some((k) => map[k] === "pending");

    if (!exists) return { tone: "yellow", label: "Faltan documentos" };
    if (rejected) return { tone: "red", label: "Documentos rechazados" };
    if (approved) return { tone: "green", label: "Documentos aprobados" };
    if (pending) return { tone: "yellow", label: "En revisión" };

    return { tone: "gray", label: "Estado desconocido" };
  };

  const readableStatus = (status) => {
    if (status === "active") return "Activa";
    if (status === "paused") return "Pausada";
    if (status === "closed") return "Cerrada";
    return status;
  };

  // =======================
  //  Crear publicación
  // =======================
  const handlePublish = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!marca.trim() || !modelo.trim()) {
      setMsg("Completa marca y modelo.");
      return;
    }

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setMsg("No hay sesión activa.");
      setSaving(false);
      return;
    }

    // 1) Crear vehículo
    const { data: veh, error: vehErr } = await supabase
      .from("vehiculos")
      .insert([
        {
          owner_user_id: userId,
          placa: placa.trim() || null,
          marca: marca.trim(),
          modelo: modelo.trim(),
          anio: Number(anio),
        },
      ])
      .select()
      .single();

    if (vehErr) {
      setMsg("Error creando vehículo: " + vehErr.message);
      setSaving(false);
      return;
    }

    // 2) Crear listing (status válido por constraint)
    const { error: listErr } = await supabase.from("vehicle_listings").insert([
      {
        vehicle_id: veh.id,
        investor_user_id: userId,
        base_amount: Number(baseAmount),
        base_term_months: Number(termMonths),
        base_installment: Number(installment),
        allow_counteroffers: allowCounteroffers,
        status: "paused",
      },
    ]);

    if (listErr) {
      setMsg("Vehículo creado, pero falló publicación: " + listErr.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    navigate(`/publish/docs/${veh.id}`, { replace: true });
  };

  // =======================
  //  Activar / Pausar
  // =======================
  const updateListingStatus = async (listingId, status) => {
    setBusyId(listingId);
    setMsg("");

    const { error } = await supabase
      .from("vehicle_listings")
      .update({ status })
      .eq("id", listingId);

    if (error) setMsg("No se pudo actualizar: " + error.message);

    await fetchMyListings();
    setBusyId(null);
  };

  // =======================
  // ✅ Eliminar publicación (y su vehículo)
  // =======================
  const deleteListing = async (listing) => {
    const ok = window.confirm(
      "¿Seguro que deseas eliminar esta publicación? Esto también elimina el vehículo."
    );
    if (!ok) return;

    setBusyId(listing.id);
    setMsg("");

    // 1) borrar listing
    const { error: delListErr } = await supabase
      .from("vehicle_listings")
      .delete()
      .eq("id", listing.id);

    if (delListErr) {
      setMsg("No se pudo eliminar publicación: " + delListErr.message);
      setBusyId(null);
      return;
    }

    // 2) borrar vehículo
    const { error: delVehErr } = await supabase
      .from("vehiculos")
      .delete()
      .eq("id", listing.vehicle_id);

    if (delVehErr) {
      setMsg("Se eliminó la publicación, pero no se pudo eliminar el vehículo: " + delVehErr.message);
      setBusyId(null);
      return;
    }

    setMsg("Publicación eliminada.");
    await fetchMyListings();
    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-white">
        <Navbar />
        <div className="p-8 text-white/70">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Publicar mis carros</h1>
            <p className="mt-2 text-white/70">
              Rol: <span className="text-emerald-300 font-semibold">{role}</span> ·
              Crea publicaciones y recibe contraofertas.
            </p>
          </div>

          <button
            onClick={() => navigate("/vehicles")}
            className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/85 hover:bg-white/10 transition"
          >
            Ver marketplace →
          </button>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {msg}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Form */}
          <form
            onSubmit={handlePublish}
            className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-7"
          >
            <h2 className="text-xl font-semibold">Nueva publicación</h2>
            <p className="mt-2 text-sm text-white/70">
              Ingresa los datos del vehículo y sus condiciones.
            </p>

            <div className="mt-6">
              <p className="text-sm font-semibold text-white/85">Datos del vehículo</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Placa (opcional)">
                  <Input
                    placeholder="ABC-123"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                  />
                </Field>

                <Field label="Año">
                  <Input type="number" value={anio} onChange={(e) => setAnio(e.target.value)} />
                </Field>

                <Field label="Marca">
                  <Input placeholder="Toyota" value={marca} onChange={(e) => setMarca(e.target.value)} />
                </Field>

                <Field label="Modelo">
                  <Input placeholder="Hilux" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold text-white/85">Condiciones financieras</p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="Monto base (S/)">
                  <Input type="number" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} />
                </Field>

                <Field label="Plazo (meses)">
                  <Input type="number" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
                </Field>

                <Field label="Cuota sugerida (S/)">
                  <Input type="number" value={installment} onChange={(e) => setInstallment(e.target.value)} />
                </Field>
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={allowCounteroffers}
                  onChange={(e) => setAllowCounteroffers(e.target.checked)}
                />
                Permitir contraofertas (subasta)
              </label>
            </div>

            <div className="mt-7">
              <button
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
              >
                {saving ? "Publicando..." : "Publicar vehículo"}
              </button>
            </div>
          </form>

          {/* Resumen */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <h3 className="text-lg font-semibold">Resumen</h3>

            <div className="mt-5 space-y-3 text-sm text-white/75">
              <div className="flex justify-between gap-4">
                <span>Monto</span>
                <span className="font-semibold text-white">S/ {baseAmount}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Plazo</span>
                <span className="font-semibold text-white">{termMonths} meses</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Cuota</span>
                <span className="font-semibold text-white">S/ {installment}</span>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div className="flex justify-between gap-4">
                <span>Total estimado</span>
                <span className="font-semibold text-emerald-300">S/ {estimatedTotal}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Subasta</span>
                <span className="font-semibold text-white">
                  {allowCounteroffers ? "Activa" : "Desactivada"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mis publicaciones */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Mis publicaciones</h2>
          <p className="mt-2 text-sm text-white/60">Aquí aparecen tus publicaciones pendientes y activas.</p>

          {myListings.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
              Aún no tienes publicaciones.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {myListings.map((x) => {
                const ds = docsState(x);
                const isBusy = busyId === x.id;

                return (
                  <div key={x.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <Pill tone={ds.tone}>{ds.label}</Pill>
                      <Pill tone="gray">{readableStatus(x.status)}</Pill>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">
                      {x.vehiculos?.marca} {x.vehiculos?.modelo} ({x.vehiculos?.anio})
                    </h3>

                    <p className="mt-1 text-xs text-white/50">
                      {x.vehiculos?.placa ? `Placa: ${x.vehiculos.placa}` : "Sin placa"}
                    </p>

                    <div className="mt-4 text-sm text-white/70 space-y-1">
                      <p>Monto: <b>S/ {x.base_amount}</b></p>
                      <p>Plazo: <b>{x.base_term_months} meses</b></p>
                      <p>Cuota: <b>S/ {x.base_installment}</b></p>
                    </div>

                    <div className="mt-5 grid gap-2">
                      <button
                        disabled={isBusy}
                        onClick={() => navigate(`/publish/docs/${x.vehicle_id}`)}
                        className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
                      >
                        Subir / revisar documentos
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        {x.status === "active" ? (
                          <button
                            disabled={isBusy}
                            onClick={() => updateListingStatus(x.id, "paused")}
                            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
                          >
                            Pausar
                          </button>
                        ) : (
                          <button
                            disabled={isBusy}
                            onClick={() => updateListingStatus(x.id, "active")}
                            className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-60"
                          >
                            Activar
                          </button>
                        )}

                        <button
                          disabled={isBusy}
                          onClick={() => deleteListing(x)}
                          className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-10 text-xs text-white/40">
          Flujo MVP: Publicación → Subir docs → Revisión admin → Activación
        </p>
      </div>
    </div>
  );
}
