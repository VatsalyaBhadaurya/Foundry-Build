import { Reveal } from "./Reveal";

const PAINS = [
  "where to start",
  "what components are needed",
  "what skills are required",
  "how systems connect together",
  "what sequence of execution works best",
];

export function Problem() {
  return (
    <section id="problem" className="border-t border-[var(--color-border)] py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:gap-20">
        <div>
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
              The Problem
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Ideas are easy. Building is hard.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 text-pretty leading-relaxed text-[var(--color-text-muted)]">
              Most people know what they want to build but struggle to
              understand the path from concept to construction. Complex projects
              become overwhelming long before the first part is made.
            </p>
          </Reveal>
        </div>

        <ul className="flex flex-col justify-center gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-border)]">
          {PAINS.map((p, i) => (
            <Reveal as="li" key={p} delay={i * 0.06}>
              <div className="flex items-center gap-4 bg-[var(--color-surface)] px-5 py-4">
                <span className="text-xs tabular-nums text-[var(--color-text-faint)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] text-[var(--color-text)]">{p}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
