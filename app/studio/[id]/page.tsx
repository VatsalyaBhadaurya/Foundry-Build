"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api, Blueprint } from "@/lib/api";
import { InterviewPanel } from "@/components/studio/InterviewPanel";
import { OrchestrationPanel } from "@/components/studio/OrchestrationPanel";
import { BlueprintPanel } from "@/components/studio/BlueprintPanel";

type Stage = "interview" | "orchestrating" | "complete" | "error";

interface AgentStatus {
  name: string;
  status: "waiting" | "running" | "complete" | "error";
  error?: string;
}

const AGENT_LABELS: Record<string, string> = {
  Planner: "Planning architecture",
  GitHub: "Searching GitHub",
  Research: "Finding papers",
  Budget: "Estimating costs",
  Architecture: "Designing systems",
  Roadmap: "Building roadmap",
  SkillGap: "Analyzing skill gaps",
  Risk: "Identifying risks",
  DevilsAdvocate: "Stress-testing plan",
  Blueprint: "Synthesizing blueprint",
};

const AGENT_ORDER = Object.keys(AGENT_LABELS);

export default function StudioSessionPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [stage, setStage] = useState<Stage>("interview");
  const [agents, setAgents] = useState<AgentStatus[]>(
    AGENT_ORDER.map((name) => ({ name, status: "waiting" }))
  );
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [orchestrationError, setOrchestrationError] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);

  function startOrchestration() {
    setStage("orchestrating");

    api.startOrchestration(projectId).then(() => {
      const url = api.orchestrationStreamUrl(projectId);
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);

          // Ignore keepalive pings
          if (event.type === "ping") return;

          if (event.type === "start") {
            setAgents((prev) =>
              prev.map((a) => a.name === event.agent ? { ...a, status: "running" } : a)
            );
          } else if (event.type === "complete") {
            setAgents((prev) =>
              prev.map((a) => a.name === event.agent ? { ...a, status: "complete" } : a)
            );
          } else if (event.type === "error" && event.agent !== "Orchestrator") {
            // Agent-level errors are non-fatal — mark that agent failed but keep going
            setAgents((prev) =>
              prev.map((a) => a.name === event.agent ? { ...a, status: "error", error: event.error } : a)
            );
          } else if (event.type === "blueprint_ready" || event.type === "done") {
            es.close();
            api.getBlueprint(projectId).then((bp) => {
              setBlueprint(bp);
              setStage("complete");
            }).catch((err) => {
              setOrchestrationError(err.message);
              setStage("error");
            });
          }
        } catch {
          // ignore malformed events
        }
      };

      es.onerror = () => {
        // EventSource auto-reconnects — only treat as fatal if we haven't completed
        // Wait briefly to see if the stream comes back before showing an error
        setTimeout(() => {
          if (es.readyState === EventSource.CLOSED) {
            api.getBlueprint(projectId).then((bp) => {
              setBlueprint(bp);
              setStage("complete");
            }).catch(() => {
              // Stream dropped before completion — leave as orchestrating,
              // the backend is still running
            });
          }
        }, 3000);
      };
    }).catch((err) => {
      setOrchestrationError(err.message);
      setStage("error");
    });
  }

  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  const completedCount = agents.filter((a) => a.status === "complete").length;
  const progress = Math.round((completedCount / agents.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(8,9,11,0.85)] backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <LogoIcon />
          <span className="text-[15px] font-semibold tracking-tight">FoundryBuild</span>
        </a>
        <div className="flex items-center gap-3">
          <StagePill stage={stage} />
          {stage === "complete" && blueprint && (
            <div className="flex items-center gap-2">
              <a href={api.exportUrl(projectId, "markdown")} className="rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                .md
              </a>
              <a href={api.exportUrl(projectId, "readme")} className="rounded-lg border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                README
              </a>
              <a href={api.exportUrl(projectId, "pdf")} className="rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-[#08090b] hover:opacity-90 transition-opacity">
                PDF
              </a>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {stage === "interview" && (
          <InterviewPanel
            projectId={projectId}
            onComplete={startOrchestration}
          />
        )}

        {stage === "orchestrating" && (
          <OrchestrationPanel
            agents={agents}
            agentLabels={AGENT_LABELS}
            progress={progress}
          />
        )}

        {stage === "complete" && blueprint && (
          <BlueprintPanel blueprint={blueprint} projectId={projectId} />
        )}

        {stage === "error" && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <p className="text-red-400 font-medium mb-2">Something went wrong</p>
            <p className="text-sm text-[var(--color-text-muted)]">{orchestrationError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg border border-[var(--color-border-strong)] px-4 py-2 text-sm text-[var(--color-text)]"
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function StagePill({ stage }: { stage: Stage }) {
  const map: Record<Stage, { label: string; color: string }> = {
    interview: { label: "Interview", color: "bg-blue-400" },
    orchestrating: { label: "Analyzing", color: "bg-amber-400 animate-pulse" },
    complete: { label: "Complete", color: "bg-emerald-400" },
    error: { label: "Error", color: "bg-red-400" },
  };
  const { label, color } = map[stage];
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function LogoIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md overflow-hidden">
      <Image src="/logo.png" alt="FoundryBuild" width={28} height={28} className="object-contain" priority />
    </span>
  );
}
