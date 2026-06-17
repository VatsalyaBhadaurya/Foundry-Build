"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Build", href: "#build" },
  { label: "Vision", href: "#vision" },
];

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
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2.5" aria-label="FoundryBuild home">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">FoundryBuild</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
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

        <div className="hidden md:block">
          <a
            href="#waitlist"
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[#08090b] transition-opacity hover:opacity-90"
          >
            Join Waitlist
          </a>
        </div>

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
            <a
              href="#waitlist"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-center text-sm font-medium text-[#08090b]"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Logo() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-2)]">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 1.5l5.5 3.2v6.6L8 14.5 2.5 11.3V4.7L8 1.5z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M8 5.2v5.6M5.4 6.6l5.2 2.8M10.6 6.6L5.4 9.4" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </span>
  );
}
