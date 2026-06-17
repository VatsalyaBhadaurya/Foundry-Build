import { Reveal } from "./Reveal";

export function Vision() {
  return (
    <section id="vision" className="relative overflow-hidden border-t border-[var(--color-border)] py-28 sm:py-36">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(86,104,140,0.22), transparent 70%)" }}
        aria-hidden
      />
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
            Future Vision
          </p>
          <h2 className="text-gradient text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A universal operating system for builders.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--color-text-muted)]">
            FoundryBuild is evolving toward a future where anyone can describe an
            idea and receive the knowledge, architecture, planning, and execution
            framework needed to bring it into existence.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-[var(--color-text-muted)]">
            The long-term goal is to become the intelligence layer between human
            creativity and real-world construction.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function FounderNote() {
  return (
    <section className="border-t border-[var(--color-border)] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
            Founder Note
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Why FoundryBuild exists
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 space-y-5 text-pretty text-lg leading-relaxed text-[var(--color-text-muted)]">
            <p>The world does not suffer from a lack of ideas.</p>
            <p>
              It suffers from a lack of structured pathways to transform ideas
              into reality.
            </p>
            <p className="text-[var(--color-text)]">
              FoundryBuild was created to make building accessible,
              understandable, and systematic.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
