import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // 1) Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg("Correo o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      // 2) Confirmar sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMsg("No se pudo iniciar sesión. Intenta nuevamente.");
        setLoading(false);
        return;
      }

      // 3) Detectar rol
      const role = await getMyRole();

      // 4) Redirección inteligente
      if (role === "admin") {
        navigate("/admin", { replace: true });
        return;
      }

      if (role === "investor") {
        navigate("/dashboard/investor", { replace: true });
        return;
      }

      if (role === "entrepreneur") {
        navigate("/dashboard/entrepreneur", { replace: true });
        return;
      }

      // si no tiene rol → seleccionar rol
      navigate("/select-role?setup=1", { replace: true });
    } catch (err) {
      setMsg("Ocurrió un error inesperado. Intenta nuevamente.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-white/60">
          Accede con tu correo y contraseña.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-white/70">Correo</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-500/10 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@gmail.com"
              type="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Contraseña</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-500/10 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              type="password"
              required
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {msg && (
            <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {msg}
            </div>
          )}
        </form>

        <p className="mt-5 text-sm text-white/60">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-emerald-300 hover:text-emerald-200">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
