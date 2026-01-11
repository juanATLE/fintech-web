import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function VehicleDetail() {
  const { id } = useParams(); // listing_id
  const [role, setRole] = useState(null);

  const [listing, setListing] = useState(null);
  const [offers, setOffers] = useState([]);

  const [amount, setAmount] = useState(24000);
  const [term, setTerm] = useState(24);
  const [installment, setInstallment] = useState(1150);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await getMyRole();
      setRole(r);

      const { data, error } = await supabase
        .from("vehicle_listings")
        .select(`
          id, base_amount, base_term_months, base_installment,
          allow_counteroffers, status, created_at,
          vehiculos:vehicle_id (marca, modelo, anio),
          investor_user_id
        `)
        .eq("id", id)
        .single();

      if (!error) setListing(data);

      // ofertas visibles por RLS (inversionista dueño o emprendedor dueño)
      const offersRes = await supabase
        .from("offers")
        .select("id, amount, term_months, installment, status, created_at")
        .eq("listing_id", id)
        .order("created_at", { ascending: false });

      if (!offersRes.error) setOffers(offersRes.data ?? []);

      setLoading(false);
    })();
  }, [id]);

  const submitOffer = async () => {
    setMsg("");
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setMsg("No hay sesión");
      return;
    }

    const { error } = await supabase.from("offers").insert([
      {
        listing_id: id,
        entrepreneur_user_id: userId,
        amount: Number(amount),
        term_months: Number(term),
        installment: Number(installment),
      },
    ]);

    if (error) {
      setMsg("Error enviando oferta: " + error.message);
      return;
    }

    setMsg("✅ Oferta enviada correctamente.");

    const offersRes = await supabase
      .from("offers")
      .select("id, amount, term_months, installment, status, created_at")
      .eq("listing_id", id)
      .order("created_at", { ascending: false });

    if (!offersRes.error) setOffers(offersRes.data ?? []);
  };

  if (loading) return <div className="p-8 text-white bg-[#070A0F] min-h-screen">Cargando...</div>;
  if (!listing) return <div className="p-8 text-white bg-[#070A0F] min-h-screen">No existe.</div>;

  return (
    <div className="min-h-screen bg-[#070A0F] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <h1 className="text-2xl font-semibold">
            {listing.vehiculos?.marca} {listing.vehiculos?.modelo} ({listing.vehiculos?.anio})
          </h1>

          <p className="mt-2 text-sm text-white/70">
            Monto base: <b>S/ {listing.base_amount}</b> · Plazo: <b>{listing.base_term_months} meses</b> · Cuota: <b>S/ {listing.base_installment}</b>
          </p>

          {role === "entrepreneur" && listing.allow_counteroffers && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-6">
              <h3 className="font-semibold">Mejorar oferta</h3>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
                  type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Monto" />
                <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
                  type="number" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Plazo" />
                <input className="rounded-2xl bg-white/5 border border-white/10 p-3"
                  type="number" value={installment} onChange={e=>setInstallment(e.target.value)} placeholder="Cuota" />
              </div>

              <button
                onClick={submitOffer}
                className="mt-4 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
              >
                Enviar oferta
              </button>

              {msg && <p className="mt-3 text-sm text-emerald-200">{msg}</p>}
            </div>
          )}

          <div className="mt-8">
            <h3 className="font-semibold">Ofertas</h3>
            <div className="mt-4 space-y-3">
              {offers.length === 0 ? (
                <p className="text-white/60 text-sm">Aún no hay ofertas.</p>
              ) : (
                offers.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm">
                      <b>S/ {o.amount}</b> · {o.term_months} meses · cuota <b>S/ {o.installment}</b>
                    </p>
                    <p className="text-xs text-white/60 mt-1">Estado: {o.status}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
