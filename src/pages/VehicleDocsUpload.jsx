import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import { getMyRole } from "../supabase/db";

const DOCS = [
  { key: "tarjeta_propiedad", label: "Tarjeta de propiedad" },
  { key: "foto_vehiculo", label: "Foto del vehículo" },
];

export default function VehicleDocsUpload() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [files, setFiles] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getMyRole();
      setRole(r);

      if (r !== "investor") {
        navigate("/dashboard/entrepreneur", { replace: true });
      }
    })();
  }, [navigate]);

  const uploadOne = async (docType, file) => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error("No hay sesión activa.");

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeDoc = docType;
    const path = `${userId}/${vehicleId}/${safeDoc}.${ext}`;

    // 1) subir al bucket
    const { error: upErr } = await supabase.storage
      .from("vehicle-docs")
      .upload(path, file, { upsert: true });

    if (upErr) throw new Error("No se pudo subir el archivo: " + upErr.message);

    // 2) upsert en DB (EVITA duplicados)
    const { error: dbErr } = await supabase.from("vehicle_documents").upsert(
      [
        {
          vehicle_id: vehicleId,
          owner_user_id: userId,
          doc_type: docType,
          file_path: path,
          status: "pending",
        },
      ],
      { onConflict: "vehicle_id,doc_type" }
    );

    if (dbErr)
      throw new Error(
        "Archivo subido, pero no se pudo registrar en la base de datos: " + dbErr.message
      );
  };

  const handleUploadAll = async () => {
    setMsg("");
    setLoading(true);

    try {
      for (const d of DOCS) {
        const f = files[d.key];
        if (!f) throw new Error(`Falta subir: ${d.label}`);
      }

      for (const d of DOCS) {
        await uploadOne(d.key, files[d.key]);
      }

      setMsg("Documentos enviados. Quedan en revisión del administrador.");
      setTimeout(() => navigate("/dashboard/investor"), 1500);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl p-8">
        <h1 className="text-3xl font-semibold">Subir documentos del vehículo</h1>
        <p className="mt-2 text-white/70">
          Vehículo ID: <span className="text-white/90">{vehicleId}</span>
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7">
          <h2 className="text-xl font-semibold">Documentos requeridos</h2>
          <p className="mt-2 text-sm text-white/60">
            Formatos aceptados: PDF, JPG, PNG.
          </p>

          <div className="mt-6 space-y-4">
            {DOCS.map((d) => (
              <div
                key={d.key}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <p className="text-sm font-semibold">{d.label}</p>

                <input
                  className="mt-3 block w-full text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-emerald-400"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setFiles((prev) => ({
                      ...prev,
                      [d.key]: e.target.files?.[0],
                    }))
                  }
                />

                <p className="mt-2 text-xs text-white/50">
                  {files[d.key]?.name ? `Archivo: ${files[d.key].name}` : "No seleccionado"}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handleUploadAll}
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400 disabled:opacity-60 transition"
          >
            {loading ? "Subiendo..." : "Enviar documentos a validación"}
          </button>

          {msg && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-white/40">
          Nota: la subasta se habilita cuando el administrador aprueba los documentos.
        </p>
      </div>
    </div>
  );
}
