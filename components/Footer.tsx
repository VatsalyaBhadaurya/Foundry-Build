const LINKS = [
  { label: "Vision", href: "#vision" },
  { label: "Roadmap", href: "#solution" },
  { label: "GitHub", href: "https://github.com/VatsalyaBhadaurya/Foundry-Build" },
  { label: "Contact", href: "#waitlist" },
];

const COMPANY = "Nextgen Research Lab And Infrastructure Development Pvt Ltd";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <span className="text-[15px] font-semibold tracking-tight">FoundryBuild</span>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
            Turn ideas into buildable reality.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-[var(--color-text-faint)]">
            A product by {COMPANY}
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

        <div className="text-sm">
          <p className="mb-3 font-medium text-[var(--color-text)]">Contact</p>
          <p className="text-[var(--color-text-muted)]">Vatsalya Bhadaurya</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <a href="mailto:vatsalya@nextgenrl.com" className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]">
              vatsalya@nextgenrl.com
            </a>
            <a href="https://www.linkedin.com/in/vatsalya-bhadaurya/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]">
              LinkedIn
            </a>
            <a href="https://github.com/VatsalyaBhadaurya" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]">
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-6">
        <p className="text-xs text-[var(--color-text-faint)]">
          © {new Date().getFullYear()} {COMPANY}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
