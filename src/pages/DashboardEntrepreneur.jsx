import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function DashboardEntrepreneur() {
  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl p-8 grid gap-6 md:grid-cols-[280px_1fr]">
        <Sidebar />

        <main className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <h1 className="text-3xl font-semibold">Dashboard Emprendedor 🚀</h1>
          <p className="mt-2 text-white/70">
            Postula a vehículos, mejora tu oferta y paga cuotas con QR.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/60">Marketplace</p>
              <h3 className="mt-2 text-lg font-semibold">Ver vehículos</h3>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/60">Pagos</p>
              <h3 className="mt-2 text-lg font-semibold">Mis cuotas</h3>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs text-white/60">Contrato</p>
              <h3 className="mt-2 text-lg font-semibold">Mi contrato</h3>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
