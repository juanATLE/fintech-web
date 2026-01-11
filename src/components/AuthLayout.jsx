import { Link } from "react-router-dom";

export default function AuthLayout({
  title,
  subtitle,
  children,
  bottomText,
  bottomLinkText,
  bottomLinkTo,
}) {
  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      {/* glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute top-40 right-[-140px] h-[440px] w-[440px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      {/* top bar */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
              🚗
            </div>
            <div>
              <p className="text-sm font-semibold leading-4">Chronos</p>
              <p className="text-xs text-white/60">Vehículos como activos</p>
            </div>
          </Link>

          <div className="text-xs text-white/60 hidden sm:block">
            Plataforma Fintech · Contratos · Pagos · Telemetría
          </div>
        </div>
      </header>

      {/* content */}
      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2">
        {/* left text */}
        <section className="hidden md:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Seguridad y trazabilidad desde el inicio
          </p>

          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            {title}
          </h1>

          <p className="mt-4 text-white/70 leading-7">
            {subtitle}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-white/60">KYC / AML</p>
              <p className="mt-1 font-semibold">Onboarding seguro</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-white/60">Pagos</p>
              <p className="mt-1 font-semibold">QR Yape / Plin</p>
            </div>
          </div>
        </section>

        {/* auth card */}
        <section className="grid place-items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/30 backdrop-blur">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-white/70">{subtitle}</p>

            <div className="mt-6">{children}</div>

            <div className="mt-6 border-t border-white/10 pt-5 text-sm text-white/70">
              {bottomText}{" "}
              <Link
                className="font-semibold text-emerald-300 hover:text-emerald-200"
                to={bottomLinkTo}
              >
                {bottomLinkText}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
