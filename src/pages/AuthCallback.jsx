import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Procesando verificación...");

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);

        const code = url.searchParams.get("code");
        const token_hash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type"); // signup / recovery / magiclink / invite

        // ✅ Caso 1: PKCE code
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );

          if (error) {
            setMsg("❌ Error en verificación: " + error.message);
            return;
          }

          setMsg("✅ Verificación completada. Iniciando sesión...");
          setTimeout(() => navigate("/vehicles", { replace: true }), 800);
          return;
        }

        // ✅ Caso 2: token_hash (signup link)
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type,
          });

          if (error) {
            setMsg("❌ Error en verificación: " + error.message);
            return;
          }

          setMsg("✅ Correo confirmado. Iniciando sesión...");
          setTimeout(() => navigate("/vehicles", { replace: true }), 800);
          return;
        }

        // ❌ ninguno presente
        setMsg("❌ Link inválido o incompleto. Vuelve a registrarte.");
      } catch (e) {
        setMsg("❌ Error: " + e.message);
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-xl font-semibold">Chronos</h1>
        <p className="mt-3 text-white/70">{msg}</p>
      </div>
    </div>
  );
}
