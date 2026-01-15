import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMyRole } from "../supabase/db";

export default function RequireRole({ allowed = [], children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const role = await getMyRole();

      // si no eligió rol todavía => select role
      if (!role) {
        navigate("/select-role", {
          replace: true,
          state: { next: location.pathname },
        });
        return;
      }

      // si rol no permitido => dashboard correcto
      if (!allowed.includes(role)) {
        navigate("/", { replace: true });
        return;
      }

      setLoading(false);
    })();
  }, [navigate, location.pathname, allowed]);

  if (loading) return null;
  return children;
}
