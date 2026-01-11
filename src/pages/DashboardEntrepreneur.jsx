export default function DashboardEntrepreneur() {
  return (
    <div className="min-h-screen bg-[#070A0F] text-white p-8">
      <h1 className="text-3xl font-semibold">Dashboard Emprendedor 🚀</h1>
      <p className="mt-2 text-white/70">
        Aquí verás vehículos disponibles, harás ofertas y pagarás tus cuotas.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs text-white/60">Mercado</p>
          <h3 className="mt-2 text-lg font-semibold">Vehículos disponibles</h3>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs text-white/60">Pagos</p>
          <h3 className="mt-2 text-lg font-semibold">QR Yape / Plin</h3>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs text-white/60">Contrato</p>
          <h3 className="mt-2 text-lg font-semibold">Estado + alertas</h3>
        </div>
      </div>
    </div>
  );
}
