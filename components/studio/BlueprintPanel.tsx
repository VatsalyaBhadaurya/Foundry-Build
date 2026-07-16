"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Blueprint, DesignVariant, Risk, Milestone } from "@/lib/api";
import { api } from "@/lib/api";

interface Props {
  blueprint: Blueprint;
  projectId: string;
}

const SECTIONS = [
  "Overview",
  "Architecture",
  "Roadmap",
  "Costs",
  "Risks",
  "Skills",
  "Resources",
  "Critique",
  "Feasibility",
] as const;

type Section = (typeof SECTIONS)[number];

export function BlueprintPanel({ blueprint, projectId }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("Overview");

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-[var(--color-text-faint)] uppercase tracking-widest">Blueprint complete</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{blueprint.executive_summary}</h1>
      </motion.div>

      {/* Nav tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
              activeSection === s
                ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Section content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeSection === "Overview" && <OverviewSection blueprint={blueprint} />}
        {activeSection === "Architecture" && <ArchitectureSection blueprint={blueprint} />}
        {activeSection === "Roadmap" && <RoadmapSection milestones={blueprint.roadmap} />}
        {activeSection === "Costs" && <CostsSection blueprint={blueprint} />}
        {activeSection === "Risks" && <RisksSection risks={blueprint.risks} />}
        {activeSection === "Skills" && <SkillsSection blueprint={blueprint} />}
        {activeSection === "Resources" && <ResourcesSection blueprint={blueprint} />}
        {activeSection === "Critique" && <CritiqueSection blueprint={blueprint} />}
        {activeSection === "Feasibility" && <FeasibilitySection blueprint={blueprint} />}
      </motion.div>

      {/* Export bar */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-[var(--color-text)]">Export this blueprint</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Download in your preferred format.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["markdown", "readme", "pdf"] as const).map((fmt) => (
            <a
              key={fmt}
              href={api.exportUrl(projectId, fmt)}
              className="rounded-lg border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors capitalize"
            >
              {fmt === "readme" ? "GitHub README" : fmt === "markdown" ? "Markdown" : "PDF"}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3.5">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--color-text)]">{title}</h3>
      </div>
      <div className="bg-[var(--color-surface)] p-5">{children}</div>
    </div>
  );
}

function TagList({ items, color = "default" }: { items: string[]; color?: "default" | "green" | "blue" }) {
  const cls = {
    default: "border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  }[color];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-md border px-2.5 py-1 text-xs font-medium ${cls}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-faint)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function OverviewSection({ blueprint }: { blueprint: Blueprint }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Problem Statement">
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{blueprint.problem_statement}</p>
      </SectionCard>
      <SectionCard title="Objectives">
        <BulletList items={blueprint.objectives} />
      </SectionCard>
      {blueprint.assumptions.length > 0 && (
        <SectionCard title="Assumptions">
          <BulletList items={blueprint.assumptions} />
        </SectionCard>
      )}
      {blueprint.constraints.length > 0 && (
        <SectionCard title="Constraints">
          <BulletList items={blueprint.constraints} />
        </SectionCard>
      )}
      {blueprint.future_work.length > 0 && (
        <SectionCard title="Future Work">
          <BulletList items={blueprint.future_work} />
        </SectionCard>
      )}
    </div>
  );
}

const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!chart) { setStatus("done"); return; }
    let cancelled = false;

    const render = () => {
      const m = (window as any).mermaid;
      m.initialize({
        startOnLoad: false,
        look: "handDrawn",
        theme: "neutral",
        securityLevel: "loose",
        flowchart: { useMaxWidth: true, htmlLabels: false },
      });
      const id = `mermaid-${Date.now()}`;
      m.render(id, chart)
        .then(({ svg }: { svg: string }) => {
          if (cancelled || !ref.current) return;
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) { svgEl.style.width = "100%"; svgEl.style.height = "auto"; }
          if (!cancelled) setStatus("done");
        })
        .catch(() => { if (!cancelled) setStatus("error"); });
    };

    if ((window as any).mermaid) {
      render();
    } else {
      const script = document.createElement("script");
      script.src = MERMAID_CDN;
      script.onload = render;
      script.onerror = () => { if (!cancelled) setStatus("error"); };
      document.head.appendChild(script);
    }

    return () => { cancelled = true; };
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-[#e2e4e7] bg-white shadow-sm">
      <div className="px-4 py-2.5 border-b border-[#e2e4e7] bg-[#f8f9fa] flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wider">System Architecture</span>
      </div>
      <div className="p-6">
        {status === "loading" && (
          <div className="flex items-center justify-center py-16">
            <span className="text-xs text-gray-400 animate-pulse">Rendering diagram…</span>
          </div>
        )}
        {status === "error" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium">Diagram source:</p>
            <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 rounded-lg p-4 overflow-x-auto">
              {chart}
            </pre>
          </div>
        )}
        <div ref={ref} className={status !== "done" ? "hidden" : ""} />
      </div>
    </div>
  );
}

function ArchitectureSection({ blueprint }: { blueprint: Blueprint }) {
  return (
    <div className="space-y-4">
      {blueprint.architecture_diagram && (
        <MermaidDiagram chart={blueprint.architecture_diagram} />
      )}
      <SectionCard title="System Architecture">
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{blueprint.system_architecture}</p>
      </SectionCard>
      {blueprint.tech_stack.length > 0 && (
        <SectionCard title="Technology Stack">
          <TagList items={blueprint.tech_stack} color="blue" />
        </SectionCard>
      )}
      {blueprint.hardware.length > 0 && (
        <SectionCard title="Hardware">
          <TagList items={blueprint.hardware} />
        </SectionCard>
      )}
      {blueprint.software_components.length > 0 && (
        <SectionCard title="Software Components">
          <BulletList items={blueprint.software_components} />
        </SectionCard>
      )}
      {blueprint.apis.length > 0 && (
        <SectionCard title="APIs & Services">
          <TagList items={blueprint.apis} />
        </SectionCard>
      )}
      {blueprint.libraries.length > 0 && (
        <SectionCard title="Libraries">
          <TagList items={blueprint.libraries} />
        </SectionCard>
      )}
      {blueprint.models.length > 0 && (
        <SectionCard title="Models">
          <TagList items={blueprint.models} color="green" />
        </SectionCard>
      )}
      {blueprint.datasets.length > 0 && (
        <SectionCard title="Datasets">
          <TagList items={blueprint.datasets} />
        </SectionCard>
      )}
      {blueprint.three_designs.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">Three Design Paths</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {blueprint.three_designs.map((d) => (
              <DesignCard key={d.label} design={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DesignCard({ design }: { design: DesignVariant }) {
  const colors: Record<string, string> = {
    Budget: "border-blue-500/30 bg-blue-500/5",
    Balanced: "border-[var(--color-border-strong)] bg-[var(--color-surface)]",
    Premium: "border-amber-500/30 bg-amber-500/5",
  };
  return (
    <div className={`rounded-[var(--radius-card)] border p-5 ${colors[design.label] ?? colors.Balanced}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-text)]">{design.label}</span>
        <span className="text-xs text-[var(--color-text-faint)]">${design.estimated_cost_usd?.toLocaleString()}</span>
      </div>
      <p className="mb-3 text-xs text-[var(--color-text-muted)]">{design.performance}</p>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-emerald-400 mb-1 font-medium">Advantages</p>
          <ul className="space-y-1">
            {design.advantages.slice(0, 3).map((a, i) => (
              <li key={i} className="text-xs text-[var(--color-text-muted)]">+ {a}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs text-red-400 mb-1 font-medium">Disadvantages</p>
          <ul className="space-y-1">
            {design.disadvantages.slice(0, 3).map((d, i) => (
              <li key={i} className="text-xs text-[var(--color-text-muted)]">– {d}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RoadmapSection({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="space-y-3">
      {milestones.map((m, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3.5">
            <span className="text-xs tabular-nums font-semibold text-[var(--color-text-faint)]">
              Phase {m.phase}
            </span>
            <h4 className="flex-1 text-sm font-semibold text-[var(--color-text)]">{m.title}</h4>
            <span className="text-xs text-[var(--color-text-faint)]">{m.duration_weeks}w</span>
          </div>
          <div className="bg-[var(--color-surface)] p-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-[var(--color-text-faint)] mb-2 uppercase tracking-wider">Deliverables</p>
              <BulletList items={m.deliverables} />
            </div>
            {m.success_criteria.length > 0 && (
              <div>
                <p className="text-xs text-[var(--color-text-faint)] mb-2 uppercase tracking-wider">Success Criteria</p>
                <BulletList items={m.success_criteria} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CostsSection({ blueprint }: { blueprint: Blueprint }) {
  const { estimated_cost, bom } = blueprint;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {(["budget", "balanced", "premium"] as const).map((v) => (
          <div key={v} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
            <p className="text-xs text-[var(--color-text-faint)] capitalize mb-2">{v}</p>
            <p className="text-2xl font-semibold text-[var(--color-text)]">
              ${estimated_cost[v]?.toLocaleString() ?? "—"}
            </p>
          </div>
        ))}
      </div>
      {bom.length > 0 && (
        <SectionCard title="Bill of Materials">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="pb-2 text-left text-xs text-[var(--color-text-faint)] font-medium">Component</th>
                  <th className="pb-2 text-right text-xs text-[var(--color-text-faint)] font-medium">Qty</th>
                  <th className="pb-2 text-right text-xs text-[var(--color-text-faint)] font-medium">Unit</th>
                  <th className="pb-2 text-right text-xs text-[var(--color-text-faint)] font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {bom.map((item, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2.5 text-[var(--color-text)]">{item.component}</td>
                    <td className="py-2.5 text-right text-[var(--color-text-muted)]">{item.quantity}</td>
                    <td className="py-2.5 text-right text-[var(--color-text-muted)]">${item.unit_cost_usd?.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-[var(--color-text)]">${item.total_cost_usd?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

const RISK_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

function RisksSection({ risks }: { risks: Risk[] }) {
  return (
    <div className="space-y-3">
      {risks.map((risk, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-faint)]">
                {risk.category}
              </span>
              <p className="mt-1 text-sm font-medium text-[var(--color-text)]">{risk.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-xs font-semibold ${RISK_COLORS[risk.likelihood]}`}>
                {risk.likelihood} likelihood
              </p>
              <p className={`text-xs ${RISK_COLORS[risk.impact]}`}>
                {risk.impact} impact
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-[var(--color-surface-2)] px-4 py-3 text-xs text-[var(--color-text-muted)] leading-relaxed">
            <span className="font-medium text-[var(--color-text)]">Mitigation: </span>
            {risk.mitigation}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsSection({ blueprint }: { blueprint: Blueprint }) {
  const missing = blueprint.skill_requirements.filter((s) => !s.currently_have);
  const have = blueprint.skill_requirements.filter((s) => s.currently_have);
  return (
    <div className="space-y-4">
      {missing.length > 0 && (
        <SectionCard title={`Skills to Acquire (${missing.length})`}>
          <div className="space-y-4">
            {missing.map((skill, i) => (
              <div key={i} className="border-b border-[var(--color-border)] last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[var(--color-text)]">{skill.skill}</p>
                  <span className="text-xs text-[var(--color-text-faint)]">~{skill.learning_time_weeks}w</span>
                </div>
                <p className="text-xs text-[var(--color-text-faint)] mb-2 capitalize">{skill.level_required} level required</p>
                {skill.resources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skill.resources.map((r, j) => (
                      <span key={j} className="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      {have.length > 0 && (
        <SectionCard title={`Skills You Have (${have.length})`}>
          <TagList items={have.map((s) => s.skill)} color="green" />
        </SectionCard>
      )}
    </div>
  );
}

function ResourcesSection({ blueprint }: { blueprint: Blueprint }) {
  return (
    <div className="space-y-4">
      {blueprint.github_repos.length > 0 && (
        <SectionCard title="GitHub Repositories">
          <div className="space-y-3">
            {blueprint.github_repos.map((repo, i) => (
              <div key={i} className="border-b border-[var(--color-border)] last:border-0 pb-3 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {repo.url ? (
                      <a href={repo.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-[var(--color-text)] hover:underline">
                        {repo.name}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-[var(--color-text)]">{repo.name}</p>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)] leading-relaxed">{repo.description}</p>
                    {repo.relevance && (
                      <p className="mt-1 text-xs text-[var(--color-text-faint)] italic">{repo.relevance}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {repo.stars > 0 && <p className="text-xs text-[var(--color-text-faint)]">★ {repo.stars.toLocaleString()}</p>}
                    {repo.language && <p className="text-xs text-[var(--color-text-faint)]">{repo.language}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      {blueprint.research_papers.length > 0 && (
        <SectionCard title="Research Papers">
          <div className="space-y-4">
            {blueprint.research_papers.map((paper, i) => (
              <div key={i} className="border-b border-[var(--color-border)] last:border-0 pb-4 last:pb-0">
                {paper.url ? (
                  <a href={paper.url} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--color-text)] hover:underline leading-snug block">
                    {paper.title}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-[var(--color-text)] leading-snug">{paper.title}</p>
                )}
                <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">
                  {paper.authors.slice(0, 3).join(", ")}
                  {paper.year ? ` · ${paper.year}` : ""}
                </p>
                {paper.abstract && (
                  <p className="mt-1.5 text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
                    {paper.abstract}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function CritiqueSection({ blueprint }: { blueprint: Blueprint }) {
  const { devil_critique: c } = blueprint;
  const groups = [
    { label: "Wrong Assumptions", items: c.wrong_assumptions, color: "text-amber-400" },
    { label: "Failure Points", items: c.failure_points, color: "text-red-400" },
    { label: "Over-Engineered", items: c.over_engineered, color: "text-blue-400" },
    { label: "Under-Engineered", items: c.under_engineered, color: "text-orange-400" },
    { label: "Hidden Costs", items: c.hidden_costs, color: "text-red-300" },
    { label: "Possible Simplifications", items: c.simplifications, color: "text-emerald-400" },
    { label: "What a Senior Engineer Would Challenge", items: c.senior_challenges, color: "text-purple-400" },
  ].filter((g) => g.items?.length > 0);

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-card)] border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-sm text-amber-400 font-medium mb-1">Devil's Advocate Critique</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          An experienced engineer's critical review of this plan. Use this to stress-test assumptions before committing.
        </p>
      </div>
      {groups.map((group) => (
        <SectionCard key={group.label} title={group.label}>
          <ul className="space-y-2.5">
            {group.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
                <span className={`mt-0.5 shrink-0 font-bold ${group.color}`}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      ))}
    </div>
  );
}

function FeasibilitySection({ blueprint }: { blueprint: Blueprint }) {
  const { feasibility: f } = blueprint;
  const scores = [
    { label: "Technical Feasibility", value: f.technical_feasibility },
    { label: "Commercial Potential", value: f.commercial_potential },
    { label: "Innovation", value: f.innovation },
    { label: "Complexity", value: f.complexity },
    { label: "Scalability", value: f.scalability },
    { label: "Maintainability", value: f.maintainability },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scores.map((s) => (
          <div key={s.label} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-xs text-[var(--color-text-faint)] mb-3">{s.label}</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-semibold text-[var(--color-text)] tabular-nums">{s.value}</span>
              <span className="text-sm text-[var(--color-text-faint)] mb-0.5">/100</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border-strong)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className={`h-full rounded-full ${
                  s.value >= 70 ? "bg-emerald-500" : s.value >= 40 ? "bg-amber-500" : "bg-red-500"
                }`}
              />
            </div>
            {f.explanations?.[s.label.toLowerCase().replace(/ /g, "_")] && (
              <p className="mt-3 text-xs text-[var(--color-text-muted)] leading-relaxed">
                {f.explanations[s.label.toLowerCase().replace(/ /g, "_")]}
              </p>
            )}
          </div>
        ))}
      </div>
      <SectionCard title="Overall Recommendation">
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{f.overall_recommendation}</p>
      </SectionCard>
    </div>
  );
}
