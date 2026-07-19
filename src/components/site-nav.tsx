"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/table", label: "table" },
  { href: "/nepali-input", label: "nepali-input" },
  { href: "/nepali-datepicker", label: "datepicker" },
  { href: "/nepal-geo", label: "nepal-geo" },
  { href: "/editor", label: "editor" },
  { href: "/registry", label: "registry" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-40 border-b-[0.5px] border-border bg-page/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-[88rem] items-center gap-6 px-4 sm:px-6">
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
        <nav aria-label="Site" className="flex flex-1 items-center gap-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "text-accent"
                    : "text-secondary hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
