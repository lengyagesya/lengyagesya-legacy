export default function Home() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#050507] px-6 text-white">
      <div className="intro-grid absolute inset-0 opacity-30" />
      <div className="intro-glow absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-[34rem] sm:w-[34rem]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_0%,rgba(5,5,7,0.1)_28%,rgba(5,5,7,0.86)_72%)]" />

      <section className="intro-enter relative z-10 text-center">
        <p className="intro-kicker mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#c7d7ff]/75 sm:text-sm">
          Professional document generation
        </p>
        <h1 className="intro-brand text-6xl font-semibold tracking-[-0.04em] text-white sm:text-8xl lg:text-9xl">
          lY Docs
        </h1>
        <div className="mx-auto mt-7 h-px w-40 bg-gradient-to-r from-transparent via-[#d7e3ff]/70 to-transparent" />
      </section>
    </main>
  );
}
