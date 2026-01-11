export default function DashboardInvestor() {
  return (
    <div className="min-h-screen bg-[#070A0F] text-white p-8">
      <h1 className="text-3xl font-semibold">Dashboard Inversionista 💼</h1>
      <p className="mt-2 text-white/70">
        Aquí podrás publicar vehículos, ver ofertas y activar liquidez (factoring).
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs text-white/60">Acción</p>
          <h3 className="mt-2 text-lg font-semibold">Publicar vehículo</h3>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs text-white/60">Subastas</p>
          <h3 className="mt-2 text-lg font-semibold">Ofertas activas</h3>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs text-white/60">Liquidez</p>
          <h3 className="mt-2 text-lg font-semibold">Factoring / FPF</h3>
        </div>
      </div>
    </div>
  );
}
