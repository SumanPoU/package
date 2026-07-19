import Link from "next/link";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="site-footer mt-auto border-t-[0.5px] border-border bg-page">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-[6px] bg-accent font-mono text-[11px] font-medium text-accent-fg"
            >
              i
            </span>
            <span className="text-sm font-medium tracking-tight text-primary">
              itzsa
            </span>
          </Link>
          <p className="max-w-sm text-[13px] leading-relaxed text-secondary">
            Open-source React components for Nepali and modern product UIs.
          </p>
          <p className="text-[12px] text-tertiary">
            © {YEAR} Suman Acharya. All rights reserved.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium tracking-[0.14em] text-tertiary uppercase">
              Developer
            </p>
            <a
              href="https://sumanacharya186.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-secondary transition-colors hover:text-accent"
            >
              Suman Acharya
            </a>
            <a
              href="https://sumanacharya186.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-tertiary transition-colors hover:text-primary"
            >
              sumanacharya186.com.np
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium tracking-[0.14em] text-tertiary uppercase">
              Code
            </p>
            <a
              href="https://github.com/sumanpou"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-secondary transition-colors hover:text-accent"
            >
              github.com/sumanpou
            </a>
            <a
              href="https://github.com/SumanPoU/package"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-tertiary transition-colors hover:text-primary"
            >
              itzsa monorepo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
