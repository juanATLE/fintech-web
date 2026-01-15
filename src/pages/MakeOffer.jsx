import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function MakeOffer() {
  const navigate = useNavigate();
  const { id: listingId } = useParams();

  const [role, setRole] = useState(null);
  const [commissionAmount, setCommissionAmount] = useState(200);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const r = await getMyRole();
      setRole(r);

      if (r !== "entrepreneur") {
        navigate("/select-role?setup=1", { replace: true });
      }
    })();
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;

    if (!userId) {
      setMsg("No hay sesión activa.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("listing_offers").upsert(
      [
        {
          listing_id: listingId,
          entrepreneur_user_id: userId,
          commission_amount: Number(commissionAmount),
          message: message.trim() || null,
          status: "pending",
        },
      ],
      { onConflict: "listing_id,entrepreneur_user_id" }
    );

    if (error) {
      setMsg("No se pudo enviar oferta: " + error.message);
      setLoading(false);
      return;
    }

    setMsg("Oferta enviada correctamente.");
    setLoading(false);
    setTimeout(() => navigate(`/vehicles/${listingId}`), 1000);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-3xl font-semibold">Hacer oferta</h1>
        <p className="mt-2 text-white/60">Publicación: {listingId}</p>

        <form
          onSubmit={submit}
          className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7"
        >
          <label className="block">
            <span className="text-sm text-white/70">Comisión (S/)</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
              type="number"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm text-white/70">Mensaje (opcional)</span>
            <textarea
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="¿Por qué eres buena opción?"
            />
          </label>

          <button
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60 transition"
          >
            {loading ? "Enviando..." : "Enviar oferta"}
          </button>

          {msg && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
