import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";

export default function SelectRole() {
  const navigate = useNavigate();
  const location = useLocation();

  // viene de state: { next: "/publish" } por ejemplo
  const next = location.state?.next || "/vehicles";

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) navigate("/login", { replace: true });
    })();
  }, [navigate]);

  const setRole = async (role) => {
    setMsg("");
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setMsg("❌ No hay sesión.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      setMsg("❌ Error guardando rol: " + error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-3xl font-semibold">Elige tu rol</h1>
        <p className="mt-2 text-white/70">
          Para continuar necesitas elegir cómo deseas usar Chronos.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            disabled={loading}
            onClick={() => setRole("investor")}
            className="rounded-3xl border border-white/10 bg-white/5 p-7 text-left hover:bg-white/10 transition"
          >
            <p className="text-xs text-white/60">Rol</p>
            <h2 className="mt-2 text-xl font-semibold">Inversionista 💼</h2>
            <p className="mt-2 text-sm text-white/70">
              Publica vehículos, valida documentos y selecciona emprendedores.
            </p>
          </button>

          <button
            disabled={loading}
            onClick={() => setRole("entrepreneur")}
            className="rounded-3xl border border-white/10 bg-white/5 p-7 text-left hover:bg-white/10 transition"
          >
            <p className="text-xs text-white/60">Rol</p>
            <h2 className="mt-2 text-xl font-semibold">Emprendedor 🚗</h2>
            <p className="mt-2 text-sm text-white/70">
              Participa en subastas y compite ofreciendo comisión.
            </p>
          </button>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
