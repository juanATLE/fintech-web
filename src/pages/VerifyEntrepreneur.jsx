import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function VerifyEntrepreneur() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("+51");
  const [otp, setOtp] = useState("");

  const [msg, setMsg] = useState("");
  const [step, setStep] = useState(1); // 1: datos, 2: otp

  useEffect(() => {
    (async () => {
      const r = await getMyRole();
      setRole(r);

      if (r !== "entrepreneur") {
        navigate("/dashboard/investor", { replace: true });
        return;
      }

      // si ya tenía registro, traerlo
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userId) {
        const { data } = await supabase
          .from("entrepreneur_verification")
          .select("dni, phone, phone_verified")
          .eq("user_id", userId)
          .maybeSingle();

        if (data?.dni) setDni(data.dni);
        if (data?.phone) setPhone(data.phone);

        if (data?.phone_verified) {
          setMsg("✅ Celular ya verificado.");
          setTimeout(() => navigate("/dashboard/entrepreneur"), 1200);
        }
      }

      setLoading(false);
    })();
  }, [navigate]);

  const upsertData = async () => {
    setMsg("");
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      setMsg("❌ No hay sesión.");
      return false;
    }

    const { error } = await supabase
      .from("entrepreneur_verification")
      .upsert(
        {
          user_id: userId,
          dni: dni.trim(),
          phone: phone.trim(),
          status: "pending",
        },
        { onConflict: "user_id" }
      );

    if (error) {
      setMsg("❌ Error guardando datos: " + error.message);
      return false;
    }

    return true;
  };

  // ✅ ENVÍA SMS OTP (por Edge Function)
  const sendOtp = async () => {
    setMsg("");

    if (dni.trim().length !== 8) {
      setMsg("❌ DNI inválido (8 dígitos).");
      return;
    }
    if (!phone.startsWith("+51") || phone.length < 11) {
      setMsg("❌ Celular inválido. Ej: +51987654321");
      return;
    }

    const ok = await upsertData();
    if (!ok) return;

    const { data, error } = await supabase.functions.invoke("send-sms-otp", {
      body: { phone },
    });

    if (error) {
      setMsg("❌ Error enviando SMS: " + error.message);
      return;
    }

    if (data?.ok) {
      setStep(2);
      setMsg("✅ Código enviado por SMS. Revisa tu celular.");
    } else {
      setMsg("❌ No se pudo enviar SMS.");
    }
  };

  // ✅ VERIFICA OTP (Edge Function)
  const verifyOtp = async () => {
    setMsg("");

    const { data, error } = await supabase.functions.invoke("verify-sms-otp", {
      body: { phone, otp },
    });

    if (error) {
      setMsg("❌ Error verificando OTP: " + error.message);
      return;
    }

    if (!data?.ok) {
      setMsg("❌ Código incorrecto.");
      return;
    }

    // marcar verificado en DB
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    await supabase
      .from("entrepreneur_verification")
      .update({ phone_verified: true })
      .eq("user_id", userId);

    setMsg("✅ Celular verificado correctamente.");
    setTimeout(() => navigate("/dashboard/entrepreneur", { replace: true }), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-white">
        <Navbar />
        <div className="p-8 text-white/70">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-3xl font-semibold">Verificación de Emprendedor</h1>
        <p className="mt-2 text-white/70">
          DNI + celular obligatorio para poder ofertar.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7 space-y-4">
          {step === 1 ? (
            <>
              <div>
                <p className="text-sm text-white/70">DNI</p>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                  placeholder="12345678"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div>
                <p className="text-sm text-white/70">Celular</p>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                  placeholder="+51987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button
                onClick={sendOtp}
                className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
              >
                Enviar código SMS
              </button>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-white/70">Código OTP</p>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <button
                onClick={verifyOtp}
                className="w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
              >
                Verificar
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
              >
                ← Cambiar número
              </button>
            </>
          )}

          {msg && (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
