import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function Navbar() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const loadUserAndRole = async () => {
    setLoadingRole(true);

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      setEmail("");
      setRole(null);
      setLoadingRole(false);
      return;
    }

    setEmail(user.email ?? "");

    const r = await getMyRole();
    setRole(r);
    setLoadingRole(false);
  };

  useEffect(() => {
    loadUserAndRole();

    // Escuchar cambios de sesión
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session) {
          setEmail("");
          setRole(null);
          setLoadingRole(false);
        } else {
          await loadUserAndRole();
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const isLogged = Boolean(email);

  const roleLabel =
    role === "investor"
      ? "Inversionista"
      : role === "entrepreneur"
      ? "Emprendedor"
      : role === "admin"
      ? "Administrador"
      : "Sin rol";

  const dashboardPath =
    role === "investor"
      ? "/dashboard/investor"
      : role === "entrepreneur"
      ? "/dashboard/entrepreneur"
      : role === "admin"
      ? "/admin"
      : "/select-role";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070A0F]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <span className="text-sm font-semibold text-white/90">C</span>
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
          {/* Info (si está logueado) */}
          {isLogged && (
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-xs text-white/60">{email}</p>
              <span className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {loadingRole ? "Cargando..." : roleLabel}
              </span>
            </div>
          )}

          {/* Acciones */}
          {!isLogged ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/register")}
                className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
              >
                Crear cuenta
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/select-role")}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Cambiar rol
              </button>

              <button
                onClick={logout}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
