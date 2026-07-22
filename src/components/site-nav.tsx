"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/table", label: "Table" },
  { href: "/nepali-input", label: "Nepali Input" },
  { href: "/nepali-datepicker", label: "Datepicker" },
  { href: "/bs-date", label: "BS Date" },
  { href: "/nrb-forex", label: "NRB Forex" },
  { href: "/nepal-geo", label: "Nepal Geo" },
  { href: "/editor", label: "Editor" },
  { href: "/registry", label: "Registry" },
] as const;

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.477 2 2 6.486 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.621.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.021C22 6.486 17.523 2 12 2Z" />
    </svg>
  );
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-40 border-b-[0.5px] border-border bg-page/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-[88rem] items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 no-underline"
        >
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
        <nav
          aria-label="Site"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
        >
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  active ? "text-accent" : "text-secondary hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <a
            href="https://github.com/sumanpou"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-8 items-center justify-center rounded-md text-secondary transition-colors hover:bg-muted hover:text-primary"
            aria-label="GitHub — sumanpou"
            title="GitHub"
          >
            <GitHubIcon />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
