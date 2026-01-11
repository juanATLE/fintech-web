import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error");

  useEffect(() => {
    const savedRole = localStorage.getItem("selected_role");
    setRole(savedRole);

    // si no eligió rol, lo mandamos a elegir
    if (!savedRole) navigate("/select-role");
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // 1) crear usuario auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setMsgType("error");
      setMsg(error.message);
      setLoading(false);
      return;
    }

    // 2) insertar perfil con rol
    const userId = data.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          role: role, // investor / entrepreneur
        },
      ]);

      if (profileError) {
        setMsgType("error");
        setMsg("Usuario creado, pero falló crear perfil: " + profileError.message);
        setLoading(false);
        return;
      }
    }

    setMsgType("success");
    setMsg("✅ Cuenta creada. Revisa tu correo para confirmar.");
    setLoading(false);

    // opcional
    // navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-white/70">
          Rol seleccionado:{" "}
          <span className="font-semibold text-emerald-300">{role}</span>
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-white/70">Correo</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-500/10 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@gmail.com"
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/70">Contraseña</span>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-500/10 transition"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 8 caracteres"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>

          {msg && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                msgType === "success"
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                  : "border-red-400/25 bg-red-500/10 text-red-200"
              }`}
            >
              {msg}
            </div>
          )}
        </form>

        <button
          onClick={() => navigate("/select-role")}
          className="mt-5 text-sm text-white/60 hover:text-white/90"
        >
          ← Cambiar rol
        </button>
      </div>
    </div>
  );
}
