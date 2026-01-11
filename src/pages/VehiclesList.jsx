import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";
import Navbar from "../components/Navbar";

export default function VehiclesList() {
  const [role, setRole] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getMyRole();
      setRole(r);

      const { data, error } = await supabase
        .from("vehicle_listings")
        .select(`
          id,
          base_amount,
          base_term_months,
          base_installment,
          allow_counteroffers,
          status,
          created_at,
          vehiculos:vehicle_id (
            id, marca, modelo, anio
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error) setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
  <div className="min-h-screen bg-[#070A0F] text-white">
    <Navbar />

    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Vehículos publicados</h1>
            <p className="mt-1 text-sm text-white/60">
              Marketplace de subastas Chronos
            </p>
          </div>

          {role === "investor" && (
            <Link
              to="/vehicles/new"
              className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
            >
              + Publicar
            </Link>
          )}
        </div>

        {loading ? (
          <p className="mt-8 text-white/70">Cargando...</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {items.map((x) => (
              <Link
                key={x.id}
                to={`/vehicles/${x.id}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
              >
                <p className="text-xs text-white/60">Vehículo</p>
                <h3 className="mt-2 text-lg font-semibold">
                  {x.vehiculos?.marca} {x.vehiculos?.modelo} ({x.vehiculos?.anio})
                </h3>

                <div className="mt-4 text-sm text-white/70 space-y-1">
                  <p>Monto: <b>S/ {x.base_amount}</b></p>
                  <p>Plazo: <b>{x.base_term_months} meses</b></p>
                  <p>Cuota: <b>S/ {x.base_installment}</b></p>
                </div>

                <p className="mt-4 text-xs text-white/50">
                  Contraofertas: {x.allow_counteroffers ? "Sí" : "No"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

}
