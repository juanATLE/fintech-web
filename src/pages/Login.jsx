import { useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // 1) login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg("❌ " + error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    // 2) leer rol (sin romper si no existe)
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle(); // ✅ en vez de single()

    if (profErr) {
      setMsg("❌ Error leyendo perfil: " + profErr.message);
      setLoading(false);
      return;
    }

    // 3) si no hay perfil => este user no tiene rol aún
    if (!profile) {
      // guardamos temporal para luego crear perfil
      localStorage.setItem("pending_profile_user_id", userId);
      navigate("/select-role?setup=1");
      setLoading(false);
      return;
    }

    // 4) redirigir según rol
    if (profile.role === "investor") navigate("/dashboard/investor");
    else navigate("/dashboard/entrepreneur");

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {msg && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {msg}
            </div>
          )}
        </form>

        <p className="mt-6 text-sm text-white/60">
          ¿No tienes cuenta?{" "}
          <Link className="text-emerald-300 font-semibold" to="/select-role">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
