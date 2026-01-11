import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data?.user?.email ?? "");
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Dashboard ✅</h1>
      <p>Usuario: {email}</p>

      <button onClick={logout} style={{ padding: 10, marginTop: 10 }}>
        Cerrar sesión
      </button>
    </div>
  );
}
