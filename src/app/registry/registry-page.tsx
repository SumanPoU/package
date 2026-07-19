"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { Button } from "@/components/ui/button";

const ITEMS = [
  {
    name: "data-table",
    title: "Data table",
    npm: "@itzsa/table",
    description:
      "Composable DataTable — sorting, pagination, filters, selection, editing, export, tree/detail. Synced from the npm package source.",
    status: "ready" as const,
  },
  {
    name: "editor",
    title: "Editor",
    npm: "@itzsa/editor",
    description:
      "TipTap rich text editor with Nepali input — synced from @itzsa/editor.",
    status: "ready" as const,
  },
] as const;

function installUrl(origin: string, name: string) {
  return `${origin}/r/${name}.json`;
}

export function RegistryPage() {
  const [origin, setOrigin] = useState("https://itzsa.acharya-suman.com.np");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3 border-b-[0.5px] border-border pb-8">
        <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          Distribution
        </p>
        <h1 className="text-3xl tracking-tight text-primary sm:text-4xl">
          Registry
        </h1>
        <p className="max-w-xl text-base text-secondary">
          Copy-paste installs via the{" "}
          <span className="pkg">shadcn</span> CLI. npm remains the primary path
          for versioning — use{" "}
          <code className="font-mono text-primary">pnpm add @itzsa/table</code>{" "}
          when you want semver and a normal package dependency.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button variant="primary" asChild>
            <Link href="/table">Table docs</Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://ui.shadcn.com/docs/registry"
              target="_blank"
              rel="noreferrer"
            >
              shadcn registry docs
            </a>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">npm (recommended)</h2>
        <CodeBlock showPrompt language="bash" code="pnpm add @itzsa/table" />
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-lg font-medium text-primary">
          shadcn registry items
        </h2>
        {ITEMS.map((item) => {
          const url = installUrl(origin, item.name);
          return (
            <article
              key={item.name}
              className="flex flex-col gap-3 rounded-md border-[0.5px] border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-medium text-primary">
                  {item.title}
                </h3>
                <span className="font-mono text-[12px] text-tertiary">
                  {item.status === "stub" ? "stub" : "synced"}
                </span>
              </div>
              <p className="text-sm text-secondary">{item.description}</p>
              <p className="text-[13px] text-secondary">
                npm package: <span className="pkg">{item.npm}</span>
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-tertiary uppercase tracking-wide">
                  Install via URL
                </p>
                <CodeBlock
                  language="bash"
                  showPrompt
                  code={`pnpm dlx shadcn@latest add ${url}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-tertiary uppercase tracking-wide">
                  Registry JSON
                </p>
                <CodeBlock language="text" code={url} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="flex flex-col gap-3 border-t-[0.5px] border-border pt-8">
        <h2 className="text-lg font-medium text-primary">Namespace (later)</h2>
        <p className="text-sm text-secondary">
          After this registry is deployed and verified, submit the{" "}
          <span className="pkg">itzsa</span> namespace to the official shadcn
          registry index so consumers can run{" "}
          <code className="font-mono text-accent">
            shadcn add @itzsa/data-table
          </code>
          . That step is manual for the maintainer — see{" "}
          <code className="font-mono text-primary">apps/registry/README.md</code>
          .
        </p>
      </section>
    </main>
  );
}
