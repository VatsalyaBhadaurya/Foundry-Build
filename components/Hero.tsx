"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EXAMPLES = [
  "Build a humanoid robot",
  "Build an LLM from scratch",
  "Build a weather satellite",
  "Build a SaaS platform",
  "Build a hydroponics system",
  "Build a delivery drone",
];

function useTypewriter(words: string[], active: boolean) {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const char = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    if (!active) {
      setText(words[0]);
      return;
    }
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const word = words[idx.current];
      if (!deleting.current) {
        char.current += 1;
        setText(word.slice(0, char.current));
        if (char.current === word.length) {
          deleting.current = true;
          timeout = setTimeout(tick, 1800);
          return;
        }
        timeout = setTimeout(tick, 55);
      } else {
        char.current -= 1;
        setText(word.slice(0, char.current));
        if (char.current === 0) {
          deleting.current = false;
          idx.current = (idx.current + 1) % words.length;
          timeout = setTimeout(tick, 400);
          return;
        }
        timeout = setTimeout(tick, 28);
      }
    };

    timeout = setTimeout(tick, 900);
    return () => clearTimeout(timeout);
  }, [words, active]);

  return text;
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const placeholder = useTypewriter(EXAMPLES, !reduce && !focused && value === "");

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(86,104,140,0.22), transparent 70%)" }}
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-1.5 text-[13px] text-[var(--color-text-muted)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Engineering intelligence — now in private preview
        </motion.div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-gradient text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
        >
          Build Anything.
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg"
        >
          Describe what you want to create. From software and AI systems to
          robotics, electronics, products, infrastructure, and machines —
          FoundryBuild generates structured plans, architectures, dependencies,
          and execution paths.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-10 max-w-xl"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (value.trim()) {
                sessionStorage.setItem("foundry_prefill", value.trim());
                window.location.href = "/studio";
              } else {
                const el = document.getElementById("waitlist");
                el?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="group relative flex items-center rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-1.5 transition-colors focus-within:border-[#3a4250]"
          >
            <div className="pl-3 pr-1 text-[var(--color-text-faint)]" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2 9h11M9 4l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-label="Describe what you want to build"
                className="w-full bg-transparent py-2.5 text-[15px] text-[var(--color-text)] outline-none placeholder:text-transparent"
              />
              {value === "" && (
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[15px] text-[var(--color-text-faint)]"
                  aria-hidden
                >
                  {placeholder}
                  {!reduce && !focused && <span className="caret ml-0.5">|</span>}
                </span>
              )}
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[#08090b] transition-opacity hover:opacity-90"
            >
              Generate
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="https://github.com/VatsalyaBhadaurya/Foundry-Build"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-2.5 transition-colors hover:bg-[var(--color-surface-2)] w-full sm:w-auto"
            aria-label="View on GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            href="#waitlist"
            className="w-full rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-center text-sm font-medium text-[#08090b] transition-opacity hover:opacity-90 sm:w-auto"
          >
            Join Waitlist
          </a>
          <a
            href="#vision"
            className="w-full rounded-lg border border-[var(--color-border-strong)] px-5 py-2.5 text-center text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)] sm:w-auto"
          >
            See Vision
          </a>
        </motion.div>
      </div>
    </section>
  );
}
