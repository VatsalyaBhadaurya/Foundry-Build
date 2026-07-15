"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Build", href: "#build" },
  { label: "Vision", href: "#vision" },
  { label: "Contact", href: "#waitlist" },
];

function useGitHubStars(repo: string) {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}`)
      .then((r) => r.json())
      .then((d) => setStars(d.stargazers_count ?? null))
      .catch(() => {});
  }, [repo]);
  return stars;
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const stars = useGitHubStars("VatsalyaBhadaurya/Foundry-Build");

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

        {/* Right — GitHub stars */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a
            href="https://github.com/VatsalyaBhadaurya/Foundry-Build"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1.5 transition-colors hover:bg-[var(--color-surface-2)]"
          >
            <GitHubIcon />
            <span className="text-xs text-[var(--color-text-muted)]">
              {stars !== null ? (
                <span className="tabular-nums">{stars.toLocaleString()} {stars === 1 ? "star" : "stars"}</span>
              ) : (
                "Open Source"
              )}
            </span>
          </a>
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
            <a
              href="https://github.com/VatsalyaBhadaurya/Foundry-Build"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]"
            >
              <GitHubIcon />
              {stars !== null ? `${stars.toLocaleString()} stars` : "GitHub — Open Source"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z" />
    </svg>
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
