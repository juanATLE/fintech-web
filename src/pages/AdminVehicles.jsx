import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";

export default function AdminVehicles() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    setMsg("");

    // Trae publicaciones en estado "pending_docs"
    const { data, error } = await supabase
      .from("vehicle_listings")
      .select(
        `
        id,
        vehicle_id,
        investor_user_id,
        status,
        created_at,
        vehiculos:vehicle_id (
          id,
          marca,
          modelo,
          anio,
          placa
        )
      `
      )
      .in("status", ["pending_docs", "paused"])
      .order("created_at", { ascending: true });

    if (error) {
      setMsg("Error cargando publicaciones: " + error.message);
      setLoading(false);
      return;
    }

    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const vehicleDocsState = async (vehicleId) => {
    const { data, error } = await supabase
      .from("vehicle_documents")
      .select("doc_type,status")
      .eq("vehicle_id", vehicleId);

    if (error) throw new Error(error.message);

    const map = {};
    (data ?? []).forEach((x) => (map[x.doc_type] = x.status));

    return {
      tarjeta: map["tarjeta_propiedad"] === "approved",
      foto: map["foto_vehiculo"] === "approved",
    };
  };

  const tryActivateListing = async (listing) => {
    setMsg("");

    try {
      const s = await vehicleDocsState(listing.vehicle_id);

      if (!s.tarjeta || !s.foto) {
        setMsg("No se puede activar: faltan documentos aprobados.");
        return;
      }

      const { error } = await supabase
        .from("vehicle_listings")
        .update({ status: "active" })
        .eq("id", listing.id);

      if (error) throw new Error(error.message);

      setMsg("Subasta activada correctamente.");
      await load();
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-3xl font-semibold">Publicaciones pendientes</h1>
        <p className="mt-2 text-white/60 text-sm">
          Revisa documentos y activa subastas.
        </p>

        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            {msg}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-white/70">Cargando...</p>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            No hay publicaciones pendientes.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {items.map((x) => (
              <div
                key={x.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <p className="text-xs text-white/60">Vehículo</p>
                <h3 className="mt-2 text-lg font-semibold">
                  {x.vehiculos?.marca} {x.vehiculos?.modelo} ({x.vehiculos?.anio})
                </h3>

                <p className="mt-1 text-xs text-white/50">
                  {x.vehiculos?.placa ? `Placa: ${x.vehiculos.placa}` : "Sin placa"}
                </p>

                <p className="mt-4 text-xs text-white/60">
                  Estado: <span className="text-white/85">{x.status}</span>
                </p>

                <div className="mt-5 space-y-2">
                  <a
                    href="/admin/docs"
                    className="block rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-center text-sm hover:bg-white/10 transition"
                  >
                    Revisar documentos
                  </a>

                  <button
                    onClick={() => tryActivateListing(x)}
                    className="w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
                  >
                    Activar subasta
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
