"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

export function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <section id="waitlist" className="border-t border-[var(--color-border)] py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <Reveal>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Start Building.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-[var(--color-text-muted)]">
            Join early access and help shape the future of engineering
            intelligence.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {submitted ? (
            <div className="mx-auto mt-10 max-w-md rounded-[var(--radius-card)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-8">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M3.5 9.5l3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="mt-4 font-medium">You&rsquo;re on the list.</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                We&rsquo;ll reach out as access opens up. Thanks for building with us.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="mx-auto mt-10 flex max-w-md flex-col gap-3 text-left"
            >
              <div>
                <label htmlFor="wl-name" className="sr-only">
                  Name
                </label>
                <input
                  id="wl-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  autoComplete="name"
                  className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[#3a4250]"
                />
              </div>
              <div>
                <label htmlFor="wl-email" className="sr-only">
                  Email
                </label>
                <input
                  id="wl-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[#3a4250]"
                />
              </div>
              <button
                type="submit"
                className="mt-1 rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-[#08090b] transition-opacity hover:opacity-90"
              >
                Request Access
              </button>
              <p className="mt-1 text-center text-xs text-[var(--color-text-faint)]">
                No spam. We&rsquo;ll only email about access and major updates.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
