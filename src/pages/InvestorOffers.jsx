import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function InvestorOffers() {
  const navigate = useNavigate();
  const { id: listingId } = useParams();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [offers, setOffers] = useState([]);

  const load = async () => {
    setMsg("");
    setLoading(true);

    const r = await getMyRole();
    if (r !== "investor") {
      navigate("/", { replace: true });
      return;
    }

    const { data, error } = await supabase
      .from("listing_offers")
      .select(
        `
        id,
        listing_id,
        entrepreneur_user_id,
        commission_amount,
        commission_percent,
        message,
        status,
        created_at,
        entrepreneur_profiles:entrepreneur_user_id (
          full_name,
          phone,
          dni
        )
      `
      )
      .eq("listing_id", listingId)
      .order("commission_amount", { ascending: true });

    if (error) {
      setMsg("No se pudieron cargar ofertas: " + error.message);
      setOffers([]);
      setLoading(false);
      return;
    }

    setOffers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [listingId]);

  const selectWinner = async (offerId) => {
    setMsg("");

    // 1) marcar todos rejected
    const { error: rejErr } = await supabase
      .from("listing_offers")
      .update({ status: "rejected" })
      .eq("listing_id", listingId);

    if (rejErr) return setMsg("Error: " + rejErr.message);

    // 2) marcar ganador selected
    const { error: winErr } = await supabase
      .from("listing_offers")
      .update({ status: "selected" })
      .eq("id", offerId);

    if (winErr) return setMsg("Error seleccionando ganador: " + winErr.message);

    setMsg("Emprendedor seleccionado correctamente.");
    await load();
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8">
        <h1 className="text-3xl font-semibold">Ofertas recibidas</h1>
        <p className="mt-2 text-white/60">Publicación: {listingId}</p>

        {msg && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
            {msg}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-white/70">Cargando...</p>
        ) : offers.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">
            Aún no hay ofertas.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {offers.map((o) => (
              <div key={o.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs text-white/60">Emprendedor</p>
                <p className="mt-1 text-lg font-semibold">
                  {o.entrepreneur_profiles?.full_name || "Sin nombre"}
                </p>

                <div className="mt-3 text-sm text-white/70 space-y-1">
                  <p>Celular: <b>{o.entrepreneur_profiles?.phone || "-"}</b></p>
                  <p>DNI: <b>{o.entrepreneur_profiles?.dni || "-"}</b></p>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                  Comisión ofertada: <b>S/ {o.commission_amount ?? "-"}</b>
                  {o.message ? <p className="mt-2 text-white/70">Mensaje: {o.message}</p> : null}
                </div>

                <p className="mt-3 text-xs text-white/50">
                  Estado: <b>{o.status}</b>
                </p>

                <button
                  disabled={o.status === "selected"}
                  onClick={() => selectWinner(o.id)}
                  className="mt-5 w-full rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition"
                >
                  {o.status === "selected" ? "Seleccionado" : "Seleccionar emprendedor"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
