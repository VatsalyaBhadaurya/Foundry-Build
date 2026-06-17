"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

const CONTACT_EMAIL = "vatbhadaurya@gmail.com";

function buildMailto(name: string, email: string, domain: string) {
  const subject = `FoundryBuild Early Access Request — ${name}`;
  const body = [
    "Hi Vatsalya,",
    "",
    "I'd like to request early access to FoundryBuild.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Domain of work: ${domain}`,
    "",
    "What I want to build / why I'm interested:",
    "[Add a few details here]",
    "",
    "Thanks,",
    name,
  ].join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");

  const inputClass =
    "w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[var(--color-text-faint)] focus:border-[#3a4250]";

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
              <p className="mt-4 font-medium">Your email is ready to send.</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                We&rsquo;ve opened a pre-filled email in your mail app — just hit
                send and we&rsquo;ll be in touch as access opens up.
              </p>
              <a
                href={buildMailto(name, email, domain)}
                className="mt-5 inline-block rounded-lg border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)]"
              >
                Re-open email
              </a>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = buildMailto(name, email, domain);
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
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="wl-domain" className="sr-only">
                  Domain of work
                </label>
                <input
                  id="wl-domain"
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Domain of work (e.g. robotics, AI, SaaS, hardware)"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                className="mt-1 rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-[#08090b] transition-opacity hover:opacity-90"
              >
                Request Access
              </button>
              <p className="mt-1 text-center text-xs text-[var(--color-text-faint)]">
                This opens a pre-filled email to our team — review and send it
                from your mail app.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
