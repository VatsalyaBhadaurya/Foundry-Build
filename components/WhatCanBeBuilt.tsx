import { Reveal } from "./Reveal";

const ITEMS = [
  { title: "Software Systems", body: "Full-stack platforms, services, and pipelines — from data model to deployment." },
  { title: "AI Models", body: "Training architectures, datasets, and inference stacks for models built from scratch." },
  { title: "Robotics", body: "Actuation, sensing, control loops, and mechanical assemblies for physical machines." },
  { title: "Electronics", body: "Circuit design, PCBs, power systems, and embedded firmware." },
  { title: "Mechanical Systems", body: "Structures, drivetrains, tolerances, and fabrication-ready specifications." },
  { title: "Infrastructure", body: "Networks, compute, storage, and the systems that hold everything together." },
  { title: "IoT Devices", body: "Connected hardware spanning sensors, gateways, and cloud telemetry." },
  { title: "Research Projects", body: "Experimental setups, methodologies, and reproducible build paths." },
  { title: "Industrial Machines", body: "Heavy systems with subsystems, safety constraints, and assembly sequencing." },
  { title: "Autonomous Agents", body: "Goal-driven systems with planning, tools, memory, and execution loops." },
  { title: "Developer Tools", body: "SDKs, CLIs, and internal platforms that accelerate other builders." },
  { title: "Startups", body: "From product architecture to the technical roadmap behind a company." },
];

export function WhatCanBeBuilt() {
  return (
    <section id="build" className="border-t border-[var(--color-border)] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <Reveal>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
              What Can Be Built
            </p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              One framework. Every kind of system.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.06}>
              <div className="group h-full bg-[var(--color-surface)] p-6 transition-colors hover:bg-[var(--color-surface-2)]">
                <h3 className="text-[15px] font-semibold tracking-tight text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
