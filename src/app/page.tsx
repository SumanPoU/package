import Link from "next/link";

import { InstallCommand } from "@/components/install-command";
import { Button } from "@/components/ui/button";

const PACKAGES = [
  {
    href: "/table",
    name: "Table",
    pkg: "@itzsa/table",
    blurb: "Data tables with selection, export, and actions.",
  },
  {
    href: "/nepali-input",
    name: "Nepali Input",
    pkg: "@itzsa/nepali-input",
    blurb: "Unicode & Preeti transliteration fields.",
  },
  {
    href: "/nepali-datepicker",
    name: "Datepicker",
    pkg: "@itzsa/nepali-datepicker",
    blurb: "Bikram Sambat date, datetime, and range.",
  },
  {
    href: "/nepal-geo",
    name: "Nepal Geo",
    pkg: "@itzsa/nepal-geo",
    blurb: "Province → district → local → ward selects.",
  },
  {
    href: "/editor",
    name: "Editor",
    pkg: "@itzsa/editor",
    blurb: "Rich text with optional Nepali tooling.",
  },
  {
    href: "/registry",
    name: "Registry",
    pkg: "shadcn registry",
    blurb: "Install components via the registry.",
  },
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

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 70%), radial-gradient(ellipse 40% 30% at 90% 20%, color-mix(in oklab, var(--accent) 8%, transparent), transparent)",
        }}
      />

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="home-hero-in flex flex-col gap-5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-secondary uppercase">
            Component library
          </p>
          <h1 className="text-5xl font-medium tracking-tight text-primary sm:text-6xl">
            itzsa
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
            React packages for Nepal-ready product UI — tables, Nepali input,
            Bikram Sambat dates, geography selects, and a rich editor.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button variant="primary" asChild>
              <a
                href="https://github.com/sumanpou"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <GitHubIcon />
                GitHub
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SumanPoU/package"
                target="_blank"
                rel="noopener noreferrer"
              >
                View monorepo
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/nepal-geo">Explore Nepal Geo</Link>
            </Button>
          </div>
        </div>

        <div className="home-profile-in flex flex-col gap-4 rounded-xl border-[0.5px] border-border bg-card/80 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-6">
          <div
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-lg font-medium text-accent"
          >
            SA
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="text-[11px] font-medium tracking-[0.14em] text-tertiary uppercase">
              Developer
            </p>
            <p className="text-base font-medium tracking-tight text-primary">
              Suman Acharya
            </p>
            <p className="text-[13px] leading-relaxed text-secondary">
              Building open tools for Nepali & modern web products.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[13px]">
              <a
                href="https://sumanacharya186.com.np/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent transition-colors hover:text-primary"
              >
                sumanacharya186.com.np
              </a>
              <a
                href="https://github.com/sumanpou"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary transition-colors hover:text-accent"
              >
                github.com/sumanpou
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-10">
        <h2 className="mb-4 text-[11px] font-medium tracking-[0.16em] text-tertiary uppercase">
          Packages
        </h2>
        <ul className="home-grid-in grid gap-3 sm:grid-cols-2">
          {PACKAGES.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col gap-1.5 rounded-xl border-[0.5px] border-border bg-card px-4 py-3.5 no-underline transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/40"
              >
                <span className="text-[15px] font-medium tracking-tight text-primary group-hover:text-accent">
                  {item.name}
                </span>
                <span className="pkg text-[12px]">{item.pkg}</span>
                <span className="text-[13px] leading-snug text-secondary">
                  {item.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 pb-20">
        <h2 className="text-[11px] font-medium tracking-[0.16em] text-tertiary uppercase">
          Install
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-secondary">Table</p>
            <InstallCommand packages="@itzsa/table" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-secondary">Nepali Input</p>
            <InstallCommand packages="@itzsa/nepali-input" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-secondary">Datepicker</p>
            <InstallCommand packages="@itzsa/nepali-datepicker" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-secondary">Nepal Geo</p>
            <InstallCommand packages="@itzsa/nepal-geo" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-secondary">Nepal Geo Data</p>
            <InstallCommand packages="@itzsa/nepal-geo-data" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-secondary">Editor</p>
            <InstallCommand packages={["@itzsa/editor", "@itzsa/nepali-input"]} />
          </div>
        </div>
      </section>
    </main>
  );
}
