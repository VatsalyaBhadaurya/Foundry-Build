"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AgentStatus {
  name: string;
  status: "waiting" | "running" | "complete" | "error";
  error?: string;
}

interface Props {
  agents: AgentStatus[];
  agentLabels: Record<string, string>;
  progress: number;
}

export function OrchestrationPanel({ agents, agentLabels, progress }: Props) {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-center">
        <div className="mx-auto mb-5 relative flex h-16 w-16 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[var(--color-accent)]/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-t-2 border-[var(--color-accent)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-lg font-semibold text-[var(--color-text)]">{progress}%</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Analyzing your project</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {agents.filter(a => a.status === "running").length} agents working in parallel
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border-strong)]">
          <motion.div
            className="h-full rounded-full bg-[var(--color-accent)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Agent grid */}
      <div className="w-full grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
        <AnimatePresence>
          {agents.map((agent) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              label={agentLabels[agent.name] ?? agent.name}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AgentCard({ agent, label }: { agent: AgentStatus; label: string }) {
  return (
    <div className="flex items-center gap-4 bg-[var(--color-surface)] px-5 py-4">
      <StatusIcon status={agent.status} />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-[var(--color-text)] truncate">{label}</p>
        {agent.error && (
          <p className="text-xs text-red-400 truncate">{agent.error}</p>
        )}
      </div>
      <StatusBadge status={agent.status} />
    </div>
  );
}

function StatusIcon({ status }: { status: AgentStatus["status"] }) {
  if (status === "waiting") {
    return (
      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--color-border-strong)]" />
    );
  }
  if (status === "running") {
    return (
      <motion.div
        className="h-5 w-5 shrink-0 rounded-full border-2 border-t-transparent border-[var(--color-accent)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  if (status === "complete") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    );
  }
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
      <span className="text-[10px] text-red-400">!</span>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStatus["status"] }) {
  const map = {
    waiting: { label: "Waiting", class: "text-[var(--color-text-faint)]" },
    running: { label: "Running", class: "text-amber-400" },
    complete: { label: "Done", class: "text-emerald-400" },
    error: { label: "Error", class: "text-red-400" },
  };
  const { label, class: cls } = map[status];
  return <span className={`text-xs ${cls}`}>{label}</span>;
}
