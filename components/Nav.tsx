"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Build", href: "#build" },
  { label: "Vision", href: "#vision" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#waitlist" },
];

const STATS = [
  { value: "11", label: "AI Agents" },
  { value: "3", label: "Phases" },
  { value: "13K+", label: "Lines of Code" },
  { value: "11", label: "API Endpoints" },
  { value: "3", label: "Export Formats" },
  { value: "9", label: "Blueprint Tabs" },
  { value: "40", label: "Python Files" },
  { value: "18", label: "Components" },
];

function RollingStat() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % STATS.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const stat = STATS[idx];
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3.5 py-1.5 min-w-[150px]">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
      <span
        className="text-xs text-[var(--color-text-muted)] tabular-nums transition-all duration-300 whitespace-nowrap"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-4px)" }}
      >
        <span className="font-semibold text-[var(--color-text)]">{stat.value}</span>
        {" "}{stat.label}
      </span>
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-[var(--color-border)] bg-[rgba(8,9,11,0.72)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Left — logo */}
        <a href="#top" className="flex items-center gap-2.5 shrink-0" aria-label="FoundryBuild home">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">FoundryBuild</span>
        </a>

        {/* Center — nav links, truly centered */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Right — rolling project stats */}
        <div className="hidden md:flex items-center shrink-0">
          <RollingStat />
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-strong)] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d={open ? "M3 3l10 10M13 3L3 13" : "M2 4h12M2 8h12M2 12h12"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--color-border)] bg-[rgba(8,9,11,0.95)] px-6 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--color-text-muted)]"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md overflow-hidden">
      <Image src="/logo.png" alt="FoundryBuild" width={28} height={28} className="object-contain" priority />
    </span>
  );
}
