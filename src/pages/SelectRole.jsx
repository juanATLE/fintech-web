import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabase/client";

export default function SelectRole() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setup = params.get("setup"); // si viene de login

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Si viene del login, el user ya está logueado
  const createProfileIfNeeded = async (selectedRole) => {
    setLoading(true);
    setMsg("");

    // obtenemos user autenticado
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) {
      setMsg("❌ No hay sesión activa. Inicia sesión primero.");
      setLoading(false);
      return;
    }

    // upsert => crea o actualiza
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        role: selectedRole,
      },
      { onConflict: "id" }
    );

    if (error) {
      setMsg("❌ Error guardando rol: " + error.message);
      setLoading(false);
      return;
    }

    // redirigir a dashboard
    if (selectedRole === "investor") navigate("/dashboard/investor");
    else navigate("/dashboard/entrepreneur");

    setLoading(false);
  };

  const goNext = async () => {
    if (!role) return;

    // Caso A: viene por setup desde login => crear perfil
    if (setup === "1") {
      await createProfileIfNeeded(role);
      return;
    }

    // Caso B: flujo registro normal => guardamos para register
    localStorage.setItem("selected_role", role);
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold">Elige tu rol</h1>
        <p className="mt-2 text-white/70">
          Selecciona cómo quieres usar Chronos.
        </p>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setRole("investor")}
            className={`rounded-3xl border p-5 text-left transition ${
              role === "investor"
                ? "border-emerald-400/40 bg-emerald-500/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-xs text-white/60">ROL</p>
            <h3 className="mt-1 text-xl font-semibold">Quiero invertir</h3>
            <p className="mt-2 text-sm text-white/70">
              Publica vehículos, analiza ofertas y activa liquidez.
            </p>
          </button>

          <button
            onClick={() => setRole("entrepreneur")}
            className={`rounded-3xl border p-5 text-left transition ${
              role === "entrepreneur"
                ? "border-sky-400/40 bg-sky-500/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-xs text-white/60">ROL</p>
            <h3 className="mt-1 text-xl font-semibold">Quiero emprender</h3>
            <p className="mt-2 text-sm text-white/70">
              Encuentra vehículos, mejora oferta y paga cuotas con QR.
            </p>
          </button>
        </div>

        <button
          onClick={goNext}
          disabled={!role || loading}
          className="mt-7 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 transition"
        >
          {loading ? "Guardando..." : "Continuar"}
        </button>

        {msg && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
