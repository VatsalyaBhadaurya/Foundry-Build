"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface Message {
  role: "cto" | "user";
  content: string;
}

interface Props {
  projectId: string;
  onComplete: () => void;
}

export function InterviewPanel({ projectId, onComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [turn, setTurn] = useState(0);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // The interview was already started — first question is already set server-side
    // Fetch it by answering with empty (not needed — first question comes from start endpoint)
    // The project page doesn't have the first question — we need to re-fetch or store it.
    // We store _last_question in the DB. We'll ask the backend for the first question by
    // loading project state. Instead, the simplest fix: studio/page.tsx passes the first
    // question via URL param or sessionStorage.
    const firstQuestion = sessionStorage.getItem(`foundry_q_${projectId}`);
    if (firstQuestion) {
      setMessages([{ role: "cto", content: firstQuestion }]);
    } else {
      setMessages([{ role: "cto", content: "Tell me more about your project goals — what specific outcome defines success for you?" }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const answer = input.trim();
    setInput("");
    setLoading(true);
    setError("");

    setMessages((prev) => [...prev, { role: "user", content: answer }]);

    try {
      const res = await api.answerQuestion(projectId, answer);
      setTurn(res.turn);

      if (res.complete) {
        setMessages((prev) => [
          ...prev,
          { role: "cto", content: "Perfect. I have everything I need. Launching the analysis now…" },
        ]);
        setTimeout(onComplete, 1200);
      } else if (res.question) {
        setMessages((prev) => [...prev, { role: "cto", content: res.question! }]);
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send answer");
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 6v6l4 2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">CTO Interview</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Answer each question to help your AI CTO understand your project.
        </p>
      </div>

      <div className="min-h-[360px] space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                msg.role === "cto"
                  ? "border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                  : "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
              }`}>
                {msg.role === "cto" ? "CTO" : "You"}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                msg.role === "cto"
                  ? "bg-[var(--color-surface)] text-[var(--color-text)] rounded-tl-sm"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-tr-sm"
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-text-muted)]">
              CTO
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-[var(--color-surface)] px-4 py-3">
              <ThinkingDots />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="sticky bottom-6">
        <div className="flex gap-3 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2 focus-within:border-[#3a4250] transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer… (Enter to send)"
            rows={2}
            disabled={loading}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)] leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="self-end rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#08090b] transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-[var(--color-text-faint)]">
          Turn {turn} · Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-faint)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
