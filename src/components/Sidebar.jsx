import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

export default function Sidebar() {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email ?? "");

      const r = await getMyRole();
      setRole(r);
    })();
  }, []);

  const switchRole = async () => {
    if (!role) return;

    setChanging(true);

    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) {
      setChanging(false);
      return;
    }

    const newRole = role === "investor" ? "entrepreneur" : "investor";

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setRole(newRole);

      // Redirigir al dashboard del rol
      if (newRole === "investor") navigate("/dashboard/investor", { replace: true });
      else navigate("/dashboard/entrepreneur", { replace: true });
    }

    setChanging(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const dashboardPath =
    role === "investor"
      ? "/dashboard/investor"
      : role === "entrepreneur"
      ? "/dashboard/entrepreneur"
      : "/select-role?setup=1";

  return (
    <aside className="w-full md:w-72 md:min-h-[calc(100vh-64px)] rounded-3xl border border-white/10 bg-white/5 p-6">
      <div>
        <p className="text-sm font-semibold text-white">Chronos</p>
        <p className="text-xs text-white/60">{email || "Usuario"}</p>

        <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
          Rol: <span className="ml-2 font-semibold text-emerald-300">{role ?? "..."}</span>
        </div>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <Link
          to={dashboardPath}
          className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
        >
          Dashboard
        </Link>
        <Link
          to="/vehicles"
          className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
        >
          Marketplace
        </Link>
        {role === "investor" && (
          <Link
            to="/publish"
            className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
          >
            Publicar vehículo
          </Link>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={switchRole}
          disabled={!role || changing}
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60 transition"
        >
          {changing ? "Cambiando..." : "Cambiar rol"}
        </button>

        <button
          onClick={logout}
          className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10 transition"
        >
          Cerrar sesión
        </button>
      </div>

      <p className="mt-6 text-xs text-white/40">
        Cambiar rol no crea otro perfil. Solo actualiza <b>profiles.role</b>.
      </p>
    </aside>
  );
}
