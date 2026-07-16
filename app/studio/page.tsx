"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const EXAMPLES = [
  "Build a humanoid robot for warehouse automation",
  "Build an LLM from scratch with 7B parameters",
  "Build a real-time computer vision pipeline for drones",
  "Build a SaaS platform for construction project management",
  "Build an IoT sensor network for smart agriculture",
  "Build an autonomous delivery robot for last-mile logistics",
];

export default function StudioPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");

  useEffect(() => {
    const prefill = sessionStorage.getItem("foundry_prefill") ?? "";
    if (prefill) {
      sessionStorage.removeItem("foundry_prefill");
      setIdea(prefill);
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.startInterview(idea.trim());
      if (res.question) {
        sessionStorage.setItem(`foundry_q_${res.project_id}`, res.question);
      }
      router.push(`/studio/${res.project_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start. Is the backend running?");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <a href="/" className="flex items-center gap-2.5 w-fit">
          <LogoIcon />
          <span className="text-[15px] font-semibold tracking-tight">FoundryBuild</span>
        </a>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-1.5 text-[13px] text-[var(--color-text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI CTO — Private Preview
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              What do you want to build?
            </h1>
            <p className="mt-4 text-[var(--color-text-muted)] text-pretty leading-relaxed">
              Describe your engineering idea. Your AI CTO will interview you, then
              generate a complete execution-ready blueprint.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent);
              }}
              placeholder="Describe your engineering idea..."
              rows={4}
              className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 py-4 text-[15px] outline-none resize-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[#3a4250] leading-relaxed"
              disabled={loading}
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!idea.trim() || loading}
              className="w-full rounded-xl bg-[var(--color-accent)] px-5 py-3.5 text-sm font-semibold text-[#08090b] transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Starting interview…" : "Start CTO Interview →"}
            </button>
            <p className="text-center text-xs text-[var(--color-text-faint)]">
              ⌘ + Enter to submit
            </p>
          </form>

          <div className="mt-10">
            <p className="text-xs text-[var(--color-text-faint)] mb-3 uppercase tracking-widest">
              Examples
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  disabled={loading}
                  className="text-left rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] disabled:opacity-40"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
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
