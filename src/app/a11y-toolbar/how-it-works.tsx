"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function FlowArrow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("flex flex-col items-center gap-0.5 py-1.5", className)}
    >
      <span className="h-4 w-px bg-border sm:h-5" />
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        className="text-tertiary"
      >
        <path
          d="M1 1.5 6 6.5 11 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FlowNode({
  eyebrow,
  title,
  children,
  tone = "default",
  className,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  tone?: "default" | "accent" | "server" | "muted" | "warn";
  className?: string;
}) {
  const tones = {
    default: "border-border bg-card",
    accent: "border-accent/40 bg-accent/5",
    server: "border-emerald-500/35 bg-emerald-500/5",
    muted: "border-border bg-muted/40",
    warn: "border-amber-500/35 bg-amber-500/5",
  } as const;

  const eyebrowTone = {
    default: "text-tertiary",
    accent: "text-accent",
    server: "text-emerald-700 dark:text-emerald-300",
    muted: "text-tertiary",
    warn: "text-amber-800 dark:text-amber-200",
  } as const;

  return (
    <div
      className={cn(
        "min-w-0 rounded-lg border-[0.5px] px-3 py-2.5 shadow-[0_1px_0_color-mix(in_oklab,var(--border)_70%,transparent)]",
        tones[tone],
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-[10px] font-medium tracking-[0.14em] uppercase",
            eyebrowTone[tone],
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <p className="mt-0.5 text-[13px] font-medium tracking-tight text-primary">
        {title}
      </p>
      {children ? (
        <div className="mt-1.5 text-[12px] leading-relaxed text-secondary">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function CodeChip({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-sm bg-page/80 px-1 py-0.5 font-mono text-[11px] text-primary">
      {children}
    </code>
  );
}

/**
 * Architecture + chrome design flowchart for @itzsa/a11y-toolbar.
 */
export function A11yHowItWorksFlowchart({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-[0.5px] border-border bg-card",
        className,
      )}
      role="img"
      aria-label="Flowchart of how the accessibility toolbar applies preferences"
    >
      <div className="border-b-[0.5px] border-border bg-muted/40 px-3 py-2 sm:px-4">
        <p className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
          Architecture flowchart
        </p>
        <p className="text-[13px] font-medium text-primary">
          How preferences reach the page
        </p>
      </div>

      <div className="flex flex-col gap-0 p-3 sm:p-5">
        <div className="mx-auto w-full max-w-2xl">
          <FlowNode
            tone="accent"
            eyebrow="Before paint"
            title="FOUC bootstrap in <head>"
          >
            <CodeChip>getA11yFoucScript()</CodeChip> reads localStorage and sets{" "}
            <CodeChip>data-a11y-*</CodeChip> on{" "}
            <CodeChip>&lt;html&gt;</CodeChip> so the first paint already matches
            saved prefs.
          </FlowNode>
        </div>

        <FlowArrow />

        <p className="mb-2 text-center text-[11px] font-medium tracking-wide text-tertiary uppercase">
          Two trees in the host app
        </p>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="flex min-w-0 flex-col">
            <div className="mb-1 flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary/60" />
              <span className="text-[12px] font-medium text-primary">
                Content root
              </span>
            </div>
            <FlowNode
              tone="muted"
              eyebrow="Host markup"
              title="data-a11y-content"
            >
              Wrap page content here. All visual effects (text size, contrast,
              filters, links, …) are scoped under this attribute.
            </FlowNode>
            <FlowArrow />
            <FlowNode
              tone="default"
              eyebrow="CSS"
              title="styles.css effect rules"
            >
              Selectors like{" "}
              <CodeChip>html[data-a11y-text-size] [data-a11y-content]</CodeChip>{" "}
              apply tokens — never restyle the toolbar chrome accidentally.
            </FlowNode>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="mb-1 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-medium text-primary">
                Toolbar chrome
              </span>
            </div>
            <FlowNode
              tone="server"
              eyebrow="Sibling mount"
              title="A11yToolbar (outside content)"
            >
              Launcher + dialog stay outside{" "}
              <CodeChip>data-a11y-content</CodeChip> so host zoom / filters do
              not distort the controls.
            </FlowNode>
            <FlowArrow />
            <FlowNode
              tone="server"
              eyebrow="Design"
              title="Launcher → panel → cards"
            >
              Floating launcher opens a focus-trapped dialog. Sections map from{" "}
              <CodeChip>A11Y_FEATURE_REGISTRY</CodeChip>; each card toggles or
              cycles a preference.
            </FlowNode>
          </div>
        </div>

        <FlowArrow />

        <div className="mx-auto w-full max-w-2xl">
          <FlowNode
            tone="default"
            eyebrow="Runtime loop"
            title="Preference update path"
          >
            <ol className="list-decimal space-y-1 pl-4">
              <li>
                User action (card, shortcut, or host API) updates{" "}
                <CodeChip>A11yPreferences</CodeChip>
              </li>
              <li>
                Persist to <CodeChip>localStorage</CodeChip> + announce via live
                region
              </li>
              <li>
                <CodeChip>applyA11yPreferences</CodeChip> mirrors attrs + CSS
                vars onto <CodeChip>&lt;html&gt;</CodeChip>
              </li>
              <li>Package CSS re-renders the content root immediately</li>
            </ol>
          </FlowNode>
        </div>

        <FlowArrow />

        <div className="grid gap-4 sm:grid-cols-3">
          <FlowNode tone="muted" eyebrow="Input" title="Shortcuts">
            <CodeChip>DEFAULT_A11Y_SHORTCUTS</CodeChip> — panel + features;
            remap with <CodeChip>mergeA11yShortcuts</CodeChip>
          </FlowNode>
          <FlowNode tone="muted" eyebrow="Theme" title="theme / style / CSS">
            Props set <CodeChip>--itzsa-a11y-*</CodeChip> tokens. Host CSS can
            override the same vars on <CodeChip>:root</CodeChip>.
          </FlowNode>
          <FlowNode tone="muted" eyebrow="Scope" title="Not a WCAG seal">
            Chrome follows POUR / APG patterns. The host page must still ship
            semantic HTML, keyboard paths, and contrast.
          </FlowNode>
        </div>
      </div>
    </div>
  );
}
