"use client";

import { Reveal } from "./Reveal";

// ─── Plan data ───────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    tagline: "Perfect for students.",
    cta: "Get started",
    ctaHref: "#waitlist",
    featured: false,
    features: [
      "3 blueprints / month",
      "Basic exports",
      "Public projects",
      "Community templates",
      "Limited AI CTO interview",
      "Standard reasoning",
    ],
  },
  {
    name: "Pro",
    price: "$8",
    period: "/month",
    tagline: "For solo developers.",
    cta: "Start free trial",
    ctaHref: "#waitlist",
    featured: true,
    badge: "Most popular",
    features: [
      "Unlimited blueprints",
      "Unlimited exports",
      "Project history",
      "Advanced reasoning",
      "Project memory",
      "Unlimited AI CTO sessions",
      "Priority generation",
      "Private projects",
      "Architecture diagrams",
      "Custom branding",
    ],
  },
  {
    name: "Startup",
    price: "$29",
    period: "/month",
    tagline: "For teams.",
    cta: "Contact us",
    ctaHref: "#waitlist",
    featured: false,
    features: [
      "5 users",
      "Shared workspace",
      "Team memory",
      "Version history",
      "Project collaboration",
      "Approval workflows",
      "API access",
      "Custom templates",
      "Unlimited everything",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: " pricing",
    tagline: "For organizations.",
    cta: "Talk to us",
    ctaHref: "#waitlist",
    featured: false,
    features: [
      "On-prem deployment",
      "SSO",
      "Private LLM",
      "Custom agents",
      "Internal documentation",
      "Knowledge base",
      "Security",
      "Dedicated support",
    ],
  },
];

const MARKETPLACE_ITEMS = [
  "Blueprints",
  "AI Agents",
  "Templates",
  "Architectures",
  "BOM Packs",
  "Industry Packs",
];

const INDUSTRY_PACKS = [
  "Engineering",
  "Healthcare",
  "Agriculture",
  "Robotics",
  "Defence",
  "IoT",
  "Industrial Automation",
  "Education",
  "Drone",
  "Automotive",
  "AI",
];

const AGENT_PIPELINE = [
  { name: "PCB Agent", desc: "Design schematics" },
  { name: "Patent Agent", desc: "File & protect IP" },
  { name: "PCB Reviewer", desc: "DRC / ERC checks" },
  { name: "Manufacturing Agent", desc: "Fab-ready output" },
  { name: "Simulation Agent", desc: "SPICE / physics sim" },
  { name: "ROS Agent", desc: "Robotics integration" },
  { name: "FPGA Agent", desc: "HDL synthesis" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden>
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({ plan }: { plan: typeof PLANS[number] }) {
  const isFeatured = plan.featured;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 ${
        isFeatured
          ? "border-white/20 bg-white text-black shadow-[0_0_60px_-8px_rgba(255,255,255,0.18)]"
          : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:border-white/15"
      }`}
    >
      {isFeatured && plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black px-4 py-1 text-xs font-semibold text-white">
          {plan.badge}
        </div>
      )}

      <div className="mb-6">
        <p className={`text-sm font-medium ${isFeatured ? "text-black/50" : "text-[var(--color-text-faint)]"}`}>
          {plan.name}
        </p>
        <div className="mt-2 flex items-end gap-1">
          <span className={`text-4xl font-bold tracking-tight ${isFeatured ? "text-black" : "text-[var(--color-text)]"}`}>
            {plan.price}
          </span>
          <span className={`mb-1.5 text-sm ${isFeatured ? "text-black/50" : "text-[var(--color-text-muted)]"}`}>
            {plan.period}
          </span>
        </div>
        <p className={`mt-2 text-sm ${isFeatured ? "text-black/60" : "text-[var(--color-text-muted)]"}`}>
          {plan.tagline}
        </p>
      </div>

      <ul className="mb-8 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className={`flex items-start gap-2.5 text-sm ${isFeatured ? "text-black/80" : "text-[var(--color-text-muted)]"}`}>
            <span className={isFeatured ? "text-black" : "text-emerald-400"}>
              <Check />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <a
        href={plan.ctaHref}
        className={`block rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition-all ${
          isFeatured
            ? "bg-black text-white hover:bg-black/80"
            : "border border-[var(--color-border-strong)] text-[var(--color-text)] hover:border-white/25 hover:bg-white/5"
        }`}
      >
        {plan.cta}
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-[var(--color-border)] py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <Reveal>
          <div className="text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-[var(--color-text-faint)]">
              Pricing
            </p>
            <h2 className="text-gradient text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Start free. Scale as you build.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-[var(--color-text-muted)]">
              One tool from idea to production-ready blueprint. No hidden fees.
            </p>
          </div>
        </Reveal>

        {/* Plan cards */}
        <Reveal delay={0.1}>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </Reveal>

        {/* ── Future Marketplace ─────────────────────────────────────────────── */}
        <Reveal delay={0.08}>
          <div className="mt-28">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-400">
                Coming soon
              </span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Future Marketplace
            </h3>
            <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">
              Users buy and sell on a shared ecosystem. Revenue split between creators and FoundryBuild.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* What you can buy/sell */}
              <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">
                  What you can trade
                </p>
                <ul className="space-y-2">
                  {MARKETPLACE_ITEMS.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--color-text-muted)]">
                      <span className="text-emerald-400"><Check /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Industry packs */}
              <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">
                  Industry packs
                </p>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRY_PACKS.map((ind) => (
                    <span
                      key={ind}
                      className="rounded-full border border-[var(--color-border-strong)] px-3 py-1 text-xs text-[var(--color-text-muted)]"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agent Store */}
              <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 sm:col-span-2 lg:col-span-1">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">
                  Agent store — developers publish them
                </p>
                <div className="flex flex-col gap-1">
                  {AGENT_PIPELINE.map((agent, i) => (
                    <div key={agent.name}>
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--color-border-strong)] text-[10px] font-bold text-[var(--color-text-faint)]">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{agent.name}</p>
                          <p className="text-xs text-[var(--color-text-faint)]">{agent.desc}</p>
                        </div>
                      </div>
                      {i < AGENT_PIPELINE.length - 1 && (
                        <div className="ml-[22px] py-0.5 text-xs text-[var(--color-text-faint)]">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Future AI CTO ──────────────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="mt-28">
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-400">
                The future
              </span>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Future AI CTO
            </h3>
            <p className="mt-3 max-w-xl text-[var(--color-text-muted)]">
              Not just planning — a persistent engineering partner that knows your project and works alongside you every day.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {/* Dialog preview */}
              <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6">
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-faint)]">
                  A typical morning
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-[var(--color-text-faint)]">U</span>
                    <div className="rounded-xl rounded-tl-sm bg-white/8 px-4 py-2.5 text-sm text-[var(--color-text-muted)]">
                      Continue project.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-[10px] font-bold text-emerald-400">AI</span>
                    <div className="space-y-2 rounded-xl rounded-tl-sm border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-sm">
                      <p className="text-[var(--color-text-muted)]">
                        Yesterday you completed <span className="font-semibold text-[var(--color-text)]">perception</span>.
                      </p>
                      <div className="flex items-center gap-6 border-t border-white/8 pt-2 text-xs text-[var(--color-text-faint)]">
                        <span>Today's goal · <span className="text-[var(--color-text-muted)]">Integrate ROS2 Navigation</span></span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-[var(--color-text-faint)]">
                        <span>Estimated · <span className="text-[var(--color-text-muted)]">2 hours</span></span>
                      </div>
                      <div className="border-t border-white/8 pt-2 text-xs text-[var(--color-text-faint)]">
                        <p>Here are the files. Here are the PRs.</p>
                        <p className="mt-1 font-medium text-emerald-400">Proceed?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision text */}
              <div className="flex flex-col justify-center gap-5">
                {[
                  { title: "Persistent memory", body: "It remembers every decision, every tradeoff, every line of context from your project's entire history." },
                  { title: "Daily goal setting", body: "Each morning it tells you exactly what to do next, how long it'll take, and hands you the files." },
                  { title: "Engineering OS", body: "Not a chatbot. Not a copilot. A full operating system for turning ideas into shipped products." },
                ].map(({ title, body }) => (
                  <div key={title} className="flex gap-4">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{title}</p>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
