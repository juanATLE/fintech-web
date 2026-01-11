import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function VehicleCreate() {
  const navigate = useNavigate();

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState(2020);

  const [baseAmount, setBaseAmount] = useState(25000);
  const [term, setTerm] = useState(24);
  const [installment, setInstallment] = useState(1200);
  const [allowCounteroffers, setAllowCounteroffers] = useState(true);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const role = await getMyRole();
      if (role !== "investor") navigate("/dashboard/entrepreneur");
    })();
  }, [navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setMsg("No hay sesión.");
      setLoading(false);
      return;
    }

    // 1) crear vehiculo
    const { data: vehicle, error: vehicleErr } = await supabase
      .from("vehiculos")
      .insert([
        { owner_user_id: userId, marca, modelo, anio: Number(anio) },
      ])
      .select()
      .single();

    if (vehicleErr) {
      setMsg("Error creando vehículo: " + vehicleErr.message);
      setLoading(false);
      return;
    }

    // 2) crear listing
    const { error: listingErr } = await supabase
      .from("vehicle_listings")
      .insert([
        {
          vehicle_id: vehicle.id,
          investor_user_id: userId,
          base_amount: Number(baseAmount),
          base_term_months: Number(term),
          base_installment: Number(installment),
          allow_counteroffers: allowCounteroffers,
        },
      ]);

    if (listingErr) {
      setMsg("Vehículo creado pero error publicación: " + listingErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/vehicles");
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-7">
        <h1 className="text-2xl font-semibold">Publicar vehículo</h1>
        <p className="mt-2 text-white/70 text-sm">
          Crea un vehículo y publícalo para subasta.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleCreate}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
              placeholder="Marca" value={marca} onChange={e=>setMarca(e.target.value)} />
            <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
              placeholder="Modelo" value={modelo} onChange={e=>setModelo(e.target.value)} />
            <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
              placeholder="Año" type="number" value={anio} onChange={e=>setAnio(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
              placeholder="Monto (S/)" type="number" value={baseAmount} onChange={e=>setBaseAmount(e.target.value)} />
            <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
              placeholder="Plazo (meses)" type="number" value={term} onChange={e=>setTerm(e.target.value)} />
            <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
              placeholder="Cuota (S/)" type="number" value={installment} onChange={e=>setInstallment(e.target.value)} />
          </div>

          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={allowCounteroffers}
              onChange={(e) => setAllowCounteroffers(e.target.checked)}
            />
            Permitir contraofertas (subasta)
          </label>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 p-3 font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>

          {msg && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
