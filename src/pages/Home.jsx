import { Link } from "react-router-dom";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
      {children}
    </span>
  );
}

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">{desc}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl">
          {icon}
        </div>
      </div>
      <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <p className="mt-4 text-xs text-white/50">
        Seguridad, trazabilidad y escalabilidad desde el día 1.
      </p>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300 font-bold">
          {n}
        </div>
        <h4 className="text-white font-semibold">{title}</h4>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/70">{desc}</p>
    </div>
  );
}

function RoleCard({ title, bullets, tag, cta, to }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/60">{tag}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-1 text-xs text-white/70">
          MVP
        </div>
      </div>

      <ul className="mt-5 space-y-3 text-sm text-white/75">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        to={to}
        className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition"
      >
        {cta}
      </Link>

      <p className="mt-4 text-xs text-white/50">
        Recomendado para demo de concurso: flujo completo en 3-5 min.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute top-40 right-[-140px] h-[440px] w-[440px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-120px] h-[520px] w-[520px] rounded-full bg-purple-500/10 blur-[140px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
              🚗
            </div>
            <div>
              <p className="text-sm font-semibold leading-4">Chronos</p>
              <p className="text-xs text-white/60">Vehículos como activos</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a className="hover:text-white" href="#como-funciona">Cómo funciona</a>
            <a className="hover:text-white" href="#modulos">Módulos</a>
            <a className="hover:text-white" href="#roles">Roles</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2 md:py-20">
          <div>
            <Badge>Fintech peruana: contratos vehiculares → activos negociables</Badge>

            <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-5xl">
              Convierte alquiler-venta vehicular en{" "}
              <span className="text-emerald-400">activos financieros</span>{" "}
              negociables.
            </h1>

            <p className="mt-5 text-base leading-7 text-white/70">
              Creamos la primera plataforma fintech en Perú que permite a
              inversionistas publicar vehículos y a emprendedores competir por
              la mejor tasa en un sistema de <b>subasta digital</b>, con{" "}
              <b>contratos electrónicos</b>, pagos por billeteras y{" "}
              <b>telemetría</b> para proteger el colateral. Además, habilitamos{" "}
              <b>liquidez inmediata</b> con factoring y financiamiento participativo.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black hover:bg-emerald-400 transition"
              >
                Empezar ahora
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/80 hover:bg-white/10 transition"
              >
                Ver cómo funciona
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-5 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div>
                <p className="text-xs text-white/60">Módulos</p>
                <p className="mt-1 text-lg font-semibold">6</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Ejecución</p>
                <p className="mt-1 text-lg font-semibold">Digital</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Garantía</p>
                <p className="mt-1 text-lg font-semibold">Telemetría</p>
              </div>
            </div>
          </div>

          {/* Fake dashboard */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Panel Chronos</p>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                Live demo
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Subasta activa</p>
                <p className="mt-1 text-lg font-semibold">Toyota Hilux 2021</p>
                <p className="mt-2 text-sm text-white/70">
                  Mejor oferta: <b>S/ 1,180</b>/mes
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Liquidez</p>
                <p className="mt-1 text-lg font-semibold">Factoring</p>
                <p className="mt-2 text-sm text-white/70">
                  Descuento: <b>3.8%</b> mensual
                </p>
              </div>
              <div className="col-span-2 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 p-4">
                <p className="text-xs text-white/60">Telemetría</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-white/85">
                    Ubicación verificada · Motor OK
                  </p>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                    GPS activo
                  </span>
                </div>

                <div className="mt-4 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 w-[72%] rounded-full bg-emerald-400" />
                </div>
                <p className="mt-2 text-xs text-white/60">
                  Score colateral: 72/100
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Contrato</p>
                <p className="mt-1 text-sm text-white/80">
                  eSignature · Ley 27269
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Pagos</p>
                <p className="mt-1 text-sm text-white/80">
                  QR dinámico: Yape/Plin
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="modulos" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pb-14">
          <div className="flex items-end justify-between gap-8">
            <div>
              <h2 className="text-2xl font-semibold">Ecosistema completo</h2>
              <p className="mt-2 text-sm text-white/70">
                Un negocio tradicional convertido en una plataforma ágil,
                segura y escalable.
              </p>
            </div>
            <p className="hidden md:block text-sm text-white/60">
              Arquitectura preparada para crecimiento
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <FeatureCard
              icon="🧾"
              title="Contratos electrónicos"
              desc="Generación automática de contratos, trazabilidad y firma digital en la misma sesión."
            />
            <FeatureCard
              icon="📲"
              title="Pagos por billeteras"
              desc="Pagos con QR dinámico (Yape/Plin), micro-cuotas y conciliación automática."
            />
            <FeatureCard
              icon="📡"
              title="Telemetría y garantía"
              desc="Ubicación, kilometraje y alertas para asegurar el colateral del inversionista."
            />
            <FeatureCard
              icon="⚖️"
              title="KYC/AML"
              desc="Validación automática, listas restrictivas y onboarding en segundos."
            />
            <FeatureCard
              icon="🏁"
              title="Subasta digital"
              desc="Emprendedores compiten por mejor tasa y plazo, mejorando la eficiencia del mercado."
            />
            <FeatureCard
              icon="💸"
              title="Liquidez inmediata"
              desc="Factoring / FPF para que el inversionista transforme flujos futuros en capital hoy."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">Cómo funciona (MVP)</h2>
          <p className="mt-2 text-sm text-white/70">
            Flujo UX diseñado para demo rápida: de registro a contrato activo.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
            <Step
              n="1"
              title="Registro & KYC"
              desc="DNI + selfie, validación automática y rol según usuario."
            />
            <Step
              n="2"
              title="Publicación / Subasta"
              desc="Inversionistas publican vehículo; emprendedores hacen contraofertas."
            />
            <Step
              n="3"
              title="Simulación & Contrato"
              desc="Cuota/plazo/total y contrato electrónico firmado en línea."
            />
            <Step
              n="4"
              title="Pagos & Telemetría"
              desc="Micro-cuotas por billeteras + monitoreo del vehículo como garantía."
            />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold">Dos roles, un mismo motor financiero</h2>
          <p className="mt-2 text-sm text-white/70">
            Tu plataforma conecta capital e inclusión productiva con control de riesgo.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <RoleCard
              tag="Para Inversionistas"
              title="Publica vehículos y convierte contratos en activos"
              bullets={[
                "Publicación rápida de vehículos y condiciones",
                "Subasta y contraofertas para optimizar tasa",
                "Telemetría para proteger el colateral",
                "Factoring / FPF para liquidez inmediata",
              ]}
              cta="Crear cuenta inversionista"
              to="/register"
            />
            <RoleCard
              tag="Para Emprendedores"
              title="Accede a vehículos y compite por mejores condiciones"
              bullets={[
                "Lista de vehículos con filtros (cuotas/plazo)",
                "Mejora ofertas para reducir tasa",
                "Pagos por QR dinámico (Yape/Plin)",
                "Panel de contrato + alertas de cuota",
              ]}
              cta="Crear cuenta emprendedor"
              to="/register"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 p-10">
            <h2 className="text-3xl font-semibold">
              Bienvenido al nuevo mercado vehicular financiero del Perú 🇵🇪
            </h2>
            <p className="mt-3 text-white/70">
              Construyamos tu demo listo para concurso: onboarding → subasta → contrato → pago.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black hover:bg-emerald-400 transition"
              >
                Crear mi cuenta
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-white/85 hover:bg-white/10 transition"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-white/60">
          <p className="font-semibold text-white/80">Chronos · Fintech Vehicular</p>
          <p className="mt-1">
            MVP: subasta digital + contratos electrónicos + pagos + telemetría + liquidez.
          </p>
          <p className="mt-5 text-xs text-white/50">
            Demo UI. Integración Supabase Auth / DB en progreso.
          </p>
        </div>
      </footer>
    </div>
  );
}
