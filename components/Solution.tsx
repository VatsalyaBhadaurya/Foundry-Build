import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Describe",
    body: "Tell FoundryBuild what you want to build, in plain language.",
  },
  {
    n: "02",
    title: "Decompose",
    body: "Break the system into components, subsystems, dependencies, and requirements.",
  },
  {
    n: "03",
    title: "Generate",
    body: "Create structured build plans, architectures, resources, and workflows.",
  },
  {
    n: "04",
    title: "Execute",
    body: "Follow a clear roadmap from concept to reality.",
  },
];

export function Solution() {
  return (
    <section id="solution" className="border-t border-[var(--color-border)] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
              The Solution
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              From intent to execution.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="group relative h-full bg-[var(--color-surface)] p-7 transition-colors hover:bg-[var(--color-surface-2)]">
                <span className="text-sm font-medium tabular-nums text-[var(--color-text-faint)]">
                  {s.n}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {s.body}
                </p>
                {i < STEPS.length - 1 && (
                  <span
                    className="absolute right-5 top-7 hidden text-[var(--color-text-faint)] lg:block"
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8h9M8 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
