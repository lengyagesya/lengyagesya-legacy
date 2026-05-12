const projects = [
  "AI product strategy",
  "Automation blueprints",
  "Legacy systems modernization",
];

const services = [
  {
    title: "AI Strategy",
    text: "Shape practical AI roadmaps that align ambitious ideas with real business outcomes.",
  },
  {
    title: "Digital Experiences",
    text: "Design and launch polished web products with fast interfaces and memorable brand moments.",
  },
  {
    title: "Workflow Automation",
    text: "Transform repetitive operations into intelligent systems that scale with precision.",
  },
];

const navItems = ["About", "Projects", "Services", "Vision", "Contact"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-legacy-black text-legacy-pearl">
      <section className="relative isolate px-6 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(217,183,108,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.09),transparent_24%),linear-gradient(135deg,#050505_0%,#101010_42%,#050505_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-legacy-gold/70 to-transparent" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-xl">
          <a href="#" className="text-sm font-semibold tracking-[0.28em] text-legacy-gold">
            LEGACY
          </a>
          <div className="hidden items-center gap-7 text-sm text-legacy-smoke md:flex">
            {navItems.map((item) => (
              <a
                className="transition hover:text-legacy-pearl"
                href={`#${item.toLowerCase()}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-12 pb-20 pt-20 md:grid-cols-[1.08fr_0.92fr] md:pb-28 md:pt-28">
          <div>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.4em] text-legacy-gold">
              Intelligence. Craft. Continuity.
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-normal text-white sm:text-7xl lg:text-8xl">
              lengYagesya Legacy
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-legacy-smoke sm:text-2xl">
              Build the Future with AI
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                className="rounded-full bg-legacy-gold px-7 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#f0d28a]"
                href="#projects"
              >
                View Projects
              </a>
              <a
                className="rounded-full border border-white/15 bg-white/[0.05] px-7 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-white backdrop-blur-xl transition hover:border-legacy-gold/70"
                href="#contact"
              >
                Contact Me
              </a>
            </div>
          </div>

          <div className="relative min-h-[420px] rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-glow backdrop-blur-2xl">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(217,183,108,0.2),transparent_36%,rgba(255,255,255,0.08))]" />
            <div className="relative flex h-full flex-col justify-between gap-12">
              <div className="flex justify-between text-sm uppercase tracking-[0.28em] text-legacy-smoke">
                <span>AI Lab</span>
                <span>2026</span>
              </div>
              <div>
                <div className="mb-8 h-40 rounded-full border border-legacy-gold/25 bg-[radial-gradient(circle,rgba(217,183,108,0.48)_0%,rgba(217,183,108,0.14)_30%,transparent_67%)] blur-sm" />
                <p className="text-3xl font-semibold leading-tight text-white">
                  Premium systems for founders, creators, and teams building
                  what comes next.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {["Strategy", "Design", "AI"].map((item) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-black/25 px-3 py-4 text-sm text-legacy-smoke"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b0b0d] px-6 py-16 sm:px-8 lg:px-12" id="about">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <SectionLabel label="About" />
          <p className="text-3xl font-medium leading-tight text-white md:text-5xl">
            lengYagesya Legacy blends refined digital craft with practical AI
            execution, helping bold ideas become durable, elegant products.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12" id="projects">
        <div className="mx-auto max-w-7xl">
          <SectionLabel label="Projects" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {projects.map((project, index) => (
              <GlassCard key={project}>
                <p className="text-sm text-legacy-gold">0{index + 1}</p>
                <h2 className="mt-12 text-2xl font-semibold text-white">
                  {project}
                </h2>
                <p className="mt-4 leading-7 text-legacy-smoke">
                  Purpose-built initiatives designed to clarify direction,
                  accelerate delivery, and compound value over time.
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#09090a] px-6 py-20 sm:px-8 lg:px-12" id="services">
        <div className="mx-auto max-w-7xl">
          <SectionLabel label="Services" />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <GlassCard key={service.title}>
                <h2 className="text-2xl font-semibold text-white">
                  {service.title}
                </h2>
                <p className="mt-5 leading-7 text-legacy-smoke">
                  {service.text}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 lg:px-12" id="vision">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_1fr]">
          <SectionLabel label="Vision" />
          <div className="rounded-[2rem] border border-legacy-gold/20 bg-legacy-gold/[0.08] p-8 backdrop-blur-xl md:p-12">
            <p className="text-3xl font-medium leading-tight text-white md:text-5xl">
              A future where AI feels intentional, useful, and deeply human.
            </p>
            <p className="mt-7 leading-8 text-legacy-smoke">
              The vision is to build intelligent experiences that strengthen
              creative work, sharpen decision-making, and leave a legacy of
              systems people trust.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10 sm:px-8 lg:px-12" id="contact">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <SectionLabel label="Contact" />
              <h2 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
                Let&apos;s build the future.
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-legacy-smoke">
                Start a conversation about AI strategy, digital products, or a
                legacy-defining project ready for its next chapter.
              </p>
            </div>
            <a
              className="rounded-full bg-white px-7 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-black transition hover:bg-legacy-gold"
              href="mailto:hello@lengyagesya.com"
            >
              Contact Me
            </a>
          </div>
        </div>
        <footer className="mx-auto flex max-w-7xl flex-col gap-3 py-8 text-sm text-legacy-smoke sm:flex-row sm:items-center sm:justify-between">
          <span>lengYagesya Legacy</span>
          <span>Build the Future with AI</span>
        </footer>
      </section>
    </main>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-legacy-gold">
      {label}
    </p>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-legacy-gold/35">
      {children}
    </article>
  );
}
