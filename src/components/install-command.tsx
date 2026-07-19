"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

const MANAGERS: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 17l6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function buildCommand(
  manager: PackageManager,
  packages: string[],
  kind: "add" | "dlx",
  dlxArgs?: string,
): string {
  const pkg = packages.join(" ");
  switch (manager) {
    case "pnpm":
      return kind === "dlx"
        ? `pnpm dlx ${pkg}${dlxArgs ? ` ${dlxArgs}` : ""}`
        : `pnpm add ${pkg}`;
    case "npm":
      return kind === "dlx"
        ? `npx ${pkg}${dlxArgs ? ` ${dlxArgs}` : ""}`
        : `npm install ${pkg}`;
    case "yarn":
      return kind === "dlx"
        ? `yarn dlx ${pkg}${dlxArgs ? ` ${dlxArgs}` : ""}`
        : `yarn add ${pkg}`;
    case "bun":
      return kind === "dlx"
        ? `bunx ${pkg}${dlxArgs ? ` ${dlxArgs}` : ""}`
        : `bun add ${pkg}`;
  }
}

export type InstallCommandProps = {
  /** Package name(s), e.g. `@itzsa/nepali-datepicker` */
  packages: string | string[];
  /** `add` (default) or `dlx` style commands. */
  kind?: "add" | "dlx";
  /** Extra args after the package for dlx (e.g. `init -t next`). */
  dlxArgs?: string;
  defaultManager?: PackageManager;
  className?: string;
};

/**
 * shadcn-style install bar: pnpm / npm / yarn / bun tabs + copy.
 */
export function InstallCommand({
  packages,
  kind = "add",
  dlxArgs,
  defaultManager = "pnpm",
  className,
}: InstallCommandProps) {
  const _pkgKey = Array.isArray(packages) ? packages.join("\0") : packages;
  const list = useMemo(
    () => (Array.isArray(packages) ? packages : [packages]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [packages],
  );
  const [manager, setManager] = useState<PackageManager>(defaultManager);
  const [copied, setCopied] = useState(false);

  const command = useMemo(
    () => buildCommand(manager, list, kind, dlxArgs),
    [manager, list, kind, dlxArgs],
  );

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [command]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-[0.5px] border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b-[0.5px] border-border px-2 py-1.5 sm:px-2.5">
        <span className="inline-flex size-7 shrink-0 items-center justify-center text-tertiary">
          <TerminalIcon />
        </span>
        <div
          role="tablist"
          aria-label="Package manager"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
        >
          {MANAGERS.map((m) => {
            const active = m === manager;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setManager(m)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[13px] transition-colors",
                  active
                    ? "bg-muted font-medium text-primary"
                    : "text-secondary hover:text-primary",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-secondary transition-colors hover:bg-muted hover:text-primary"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <pre className="overflow-x-auto px-3.5 py-3.5 text-[13px] leading-relaxed text-primary sm:px-4">
        <code className="font-mono whitespace-pre">{command}</code>
      </pre>
    </div>
  );
}
