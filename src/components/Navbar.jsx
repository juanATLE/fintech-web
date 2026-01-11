import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function Navbar() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email ?? "");

      const r = await getMyRole();
      setRole(r);
      setLoadingRole(false);
    };

    load();

    // escuchar cambios de sesión
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setEmail("");
        setRole(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const roleBadge =
    role === "investor"
      ? "Inversionista"
      : role === "entrepreneur"
      ? "Emprendedor"
      : "Sin rol";

  const dashboardPath =
    role === "investor"
      ? "/dashboard/investor"
      : role === "entrepreneur"
      ? "/dashboard/entrepreneur"
      : "/select-role?setup=1";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070A0F]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
            🚗
          </div>
          <div>
            <p className="text-sm font-semibold leading-4 text-white">Chronos</p>
            <p className="text-xs text-white/60">Vehículos como activos</p>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link className="hover:text-white" to="/vehicles">
            Marketplace
          </Link>
          <Link className="hover:text-white" to={dashboardPath}>
            Dashboard
          </Link>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs text-white/60">{email || "Invitado"}</p>
            <span className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {loadingRole ? "Cargando..." : roleBadge}
            </span>
          </div>

          <button
            onClick={logout}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
