const navItems = ["About", "Projects", "Services", "Vision", "Contact"];

const metrics = [
  { value: "AI", label: "Strategy-led systems" },
  { value: "24/7", label: "Automation thinking" },
  { value: "01", label: "Premium brand standard" },
];

const projects = [
  {
    title: "Legacy Intelligence Studio",
    category: "AI Product",
    text: "A concept platform for turning raw business knowledge into polished AI-assisted workflows, dashboards, and decision tools.",
  },
  {
    title: "Autonomous Operations Layer",
    category: "Automation",
    text: "Blueprints for replacing repetitive handoffs with reliable automations that protect quality while increasing speed.",
  },
  {
    title: "Founder Signal System",
    category: "Software Strategy",
    text: "A premium digital command center for founders to track ideas, priorities, content, customer signals, and execution.",
  },
];

const services = [
  {
    title: "AI Strategy",
    text: "Position AI where it creates leverage: product direction, customer experience, internal knowledge, and executive decision support.",
    points: ["Use-case mapping", "AI roadmap", "Implementation planning"],
  },
  {
    title: "Software Design",
    text: "Create elegant web experiences that look premium, communicate clearly, and feel built for serious operators.",
    points: ["Landing pages", "Dashboards", "Product interfaces"],
  },
  {
    title: "Workflow Automation",
    text: "Engineer business systems that remove manual drag, connect tools, and give teams more time for creative judgment.",
    points: ["Process audit", "Automation flows", "System documentation"],
  },
];

const principles = [
  "Human-centered AI",
  "Premium digital craft",
  "Systems that compound",
  "Clarity before complexity",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-legacy-black text-legacy-pearl">
      <section className="relative isolate px-5 py-5 sm:px-8 lg:px-12">
        <LuxuryBackground />

        <nav className="fade-up mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.045] px-5 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <a
            href="#"
            className="text-xs font-bold uppercase tracking-[0.3em] text-legacy-gold sm:text-sm"
          >
            lengYagesya
          </a>
          <div className="hidden items-center gap-7 text-sm text-legacy-smoke md:flex">
            {navItems.map((item) => (
              <a
                className="transition duration-300 hover:text-legacy-pearl"
                href={`#${item.toLowerCase()}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="hidden rounded-full border border-legacy-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-legacy-gold transition hover:bg-legacy-gold hover:text-black sm:inline-flex"
          >
            Start
          </a>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-12 pb-16 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pb-24 md:pt-24 lg:gap-16">
          <div className="fade-up">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.44em] text-legacy-gold sm:text-sm">
              AI Software Brand
            </p>
            <h1 className="max-w-5xl text-5xl font-semibold leading-[0.94] tracking-normal text-white sm:text-7xl lg:text-8xl">
              lengYagesya Legacy
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-legacy-smoke sm:text-2xl">
              Build the Future with AI
            </p>
            <p className="mt-6 max-w-2xl leading-8 text-[#c9c0b5]">
              A premium portfolio and landing experience for AI strategy,
              software systems, automation, and futuristic digital products
              built with discipline, taste, and long-term ambition.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a className="btn-primary" href="#projects">
                View Projects
              </a>
              <a className="btn-secondary" href="#contact">
                Contact Me
              </a>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl"
                  key={metric.label}
                >
                  <p className="text-2xl font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-legacy-smoke">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up relative min-h-[470px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.065] p-5 shadow-glow backdrop-blur-2xl sm:p-6">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,183,108,0.24),transparent_34%,rgba(255,255,255,0.08))]" />
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-legacy-gold/25" />
            <div className="orbital-ring absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" />
            <div className="relative flex min-h-[430px] flex-col justify-between gap-10">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-legacy-smoke sm:text-sm">
                <span>Legacy OS</span>
                <span>AI / 2026</span>
              </div>
              <div className="mx-auto grid h-52 w-52 place-items-center rounded-full border border-legacy-gold/25 bg-black/30 shadow-[inset_0_0_80px_rgba(217,183,108,0.12)] sm:h-64 sm:w-64">
                <div className="pulse-core grid h-32 w-32 place-items-center rounded-full border border-legacy-gold/50 bg-legacy-gold/10 text-center text-sm font-semibold uppercase tracking-[0.28em] text-legacy-gold sm:h-40 sm:w-40">
                  Future
                </div>
              </div>
              <div className="grid gap-3">
                {["Strategic intelligence", "Premium product design", "Scalable automation"].map(
                  (item) => (
                    <div
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-[#d8d0c5]"
                      key={item}
                    >
                      <span>{item}</span>
                      <span className="h-2 w-2 rounded-full bg-legacy-gold shadow-[0_0_20px_rgba(217,183,108,0.9)]" />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section id="about" tone="dark">
        <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr]">
          <SectionLabel label="About" />
          <div>
            <h2 className="section-title">
              Built for founders, creators, and teams who want AI to feel
              premium, practical, and powerful.
            </h2>
            <p className="mt-6 max-w-3xl leading-8 text-legacy-smoke">
              lengYagesya Legacy blends AI strategy, software design, and
              automation thinking into one serious digital presence. The brand
              is focused on building systems that look sharp, work cleanly, and
              create long-term leverage.
            </p>
          </div>
        </div>
      </Section>

      <Section id="projects">
        <SectionHeader
          label="Projects"
          title="Selected directions for AI-powered products and digital systems."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {projects.map((project, index) => (
            <GlassCard key={project.title}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-legacy-gold">0{index + 1}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-legacy-smoke">
                  {project.category}
                </span>
              </div>
              <h3 className="mt-12 text-2xl font-semibold leading-tight text-white">
                {project.title}
              </h3>
              <p className="mt-5 leading-7 text-legacy-smoke">{project.text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="services" tone="dark">
        <SectionHeader
          label="Services"
          title="Premium services for AI brands, software ideas, and modern workflows."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <GlassCard key={service.title}>
              <h3 className="text-2xl font-semibold text-white">
                {service.title}
              </h3>
              <p className="mt-5 leading-7 text-legacy-smoke">{service.text}</p>
              <div className="mt-8 space-y-3">
                {service.points.map((point) => (
                  <div
                    className="flex items-center gap-3 text-sm text-[#d8d0c5]"
                    key={point}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-legacy-gold" />
                    {point}
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="vision">
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionLabel label="Vision" />
            <h2 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-6xl">
              A future where AI becomes a refined extension of human ambition.
            </h2>
          </div>
          <div className="rounded-[2rem] border border-legacy-gold/20 bg-legacy-gold/[0.08] p-7 backdrop-blur-xl md:p-10">
            <p className="leading-8 text-[#d8d0c5]">
              The vision is not just to use AI, but to build intelligent
              systems with taste: clear interfaces, calm automation, trusted
              knowledge layers, and software experiences that help serious
              people move faster without losing quality.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <div
                  className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-legacy-pearl"
                  key={principle}
                >
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <section className="relative px-5 pb-10 sm:px-8 lg:px-12" id="contact">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.065] p-7 shadow-glow backdrop-blur-2xl md:p-12">
          <div className="absolute right-10 h-52 w-52 rounded-full bg-legacy-gold/10 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <SectionLabel label="Contact" />
              <h2 className="mt-6 text-4xl font-semibold leading-tight text-white md:text-6xl">
                Let&apos;s build something that looks expensive and works even
                harder.
              </h2>
              <p className="mt-5 max-w-2xl leading-8 text-legacy-smoke">
                Start a conversation about AI strategy, software systems,
                automation, or a premium landing page for the next chapter of
                lengYagesya Legacy.
              </p>
            </div>
            <a className="btn-primary md:min-w-44" href="mailto:hello@lengyagesya.com">
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

function LuxuryBackground() {
  return (
    <>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_12%,rgba(217,183,108,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.09),transparent_24%),linear-gradient(135deg,#050505_0%,#101010_42%,#050505_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-legacy-gold/70 to-transparent" />
    </>
  );
}

function Section({
  children,
  id,
  tone,
}: {
  children: React.ReactNode;
  id: string;
  tone?: "dark";
}) {
  return (
    <section
      className={`px-5 py-20 sm:px-8 lg:px-12 ${
        tone === "dark" ? "border-y border-white/10 bg-[#0a0a0c]" : ""
      }`}
      id={id}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <SectionLabel label={label} />
      <h2 className="section-title mt-6">{title}</h2>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-legacy-gold sm:text-sm">
      {label}
    </p>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="group min-h-full rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-legacy-gold/35 hover:bg-white/[0.075]">
      {children}
    </article>
  );
}
