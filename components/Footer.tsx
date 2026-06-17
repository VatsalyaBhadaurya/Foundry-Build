const LINKS = [
  { label: "Vision", href: "#vision" },
  { label: "Roadmap", href: "#solution" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Contact", href: "mailto:hello@foundrybuild.xyz" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <span className="text-[15px] font-semibold tracking-tight">FoundryBuild</span>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            Turn ideas into buildable reality.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-10 gap-y-3">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              {...(l.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-6">
        <p className="text-xs text-[var(--color-text-faint)]">
          © {new Date().getFullYear()} FoundryBuild. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
