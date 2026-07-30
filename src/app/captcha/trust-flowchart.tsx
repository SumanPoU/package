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
 * Visual flowchart — Client vs Server trust models for @itzsa/captcha.
 * Replaces the ASCII architecture dump with a company-standard UI diagram.
 */
export function CaptchaTrustFlowchart({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-[0.5px] border-border bg-card",
        className,
      )}
      role="img"
      aria-label="Flowchart of client and server captcha trust models"
    >
      <div className="border-b-[0.5px] border-border bg-muted/40 px-3 py-2 sm:px-4">
        <p className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
          Architecture flowchart
        </p>
        <p className="text-[13px] font-medium text-primary">
          Client friction vs server-trusted challenge
        </p>
      </div>

      <div className="flex flex-col gap-0 p-3 sm:p-5">
        {/* Shared engine */}
        <div className="mx-auto w-full max-w-xl">
          <FlowNode
            tone="accent"
            eyebrow="Shared package"
            title="@itzsa/captcha — headless engine"
          >
            <div className="flex flex-wrap gap-1.5">
              <CodeChip>generateMathChallenge</CodeChip>
              <CodeChip>verifyMathAnswer</CodeChip>
              <CodeChip>generateCaptcha</CodeChip>
              <CodeChip>verifyCaptcha</CodeChip>
            </div>
          </FlowNode>
        </div>

        <FlowArrow />

        {/* Branch label */}
        <p className="mb-2 text-center text-[11px] font-medium tracking-wide text-tertiary uppercase">
          Choose trust model
        </p>

        {/* Two columns */}
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* CLIENT column */}
          <div className="flex min-w-0 flex-col items-stretch">
            <div className="mb-1 flex items-center gap-2">
              <span className="size-2 rounded-full bg-secondary/60" />
              <span className="text-[12px] font-medium text-primary">
                Client trust model
              </span>
              <span className="rounded-md border-[0.5px] border-border px-1.5 py-0.5 text-[10px] text-tertiary">
                default UI
              </span>
            </div>

            <FlowNode
              tone="muted"
              eyebrow="Step 1"
              title="Render UI in the browser"
            >
              <CodeChip>Captcha</CodeChip> · <CodeChip>MathCaptcha</CodeChip> ·{" "}
              <CodeChip>SliderCaptcha</CodeChip>
            </FlowNode>
            <FlowArrow />
            <FlowNode
              tone="default"
              eyebrow="Step 2"
              title="Generate + verify locally"
            >
              Browser calls the headless helpers. Answer exists in memory on the
              client.
            </FlowNode>
            <FlowArrow />
            <FlowNode
              tone="default"
              eyebrow="Step 3 · optional"
              title="Host verify() callback"
            >
              Runs <em>after</em> a local match — useful for logging or a soft
              API check, not a trusted source of truth.
            </FlowNode>
            <FlowArrow />
            <FlowNode tone="warn" eyebrow="Outcome" title="UX friction only">
              Good for newsletters / contact forms.{" "}
              <strong className="font-medium text-primary">
                Not a security boundary alone.
              </strong>
            </FlowNode>
          </div>

          {/* SERVER column */}
          <div className="flex min-w-0 flex-col items-stretch">
            <div className="mb-1 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-medium text-primary">
                Server trust model
              </span>
              <span className="rounded-md border-[0.5px] border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">
                company standard
              </span>
            </div>

            <FlowNode
              tone="server"
              eyebrow="Step 1"
              title="POST /api/captcha/challenge"
            >
              Server runs <CodeChip>generateMathChallenge</CodeChip>, stores
              answer in Redis / memory (TTL ~5m), returns{" "}
              <CodeChip>{"{ token, prompt }"}</CodeChip> only.
            </FlowNode>
            <FlowArrow />
            <FlowNode
              tone="server"
              eyebrow="Step 2"
              title="MathCaptcha serverChallenge"
            >
              UI shows the prompt. No local answer. Refresh calls{" "}
              <CodeChip>onRequestChallenge</CodeChip>.
            </FlowNode>
            <FlowArrow />
            <FlowNode
              tone="server"
              eyebrow="Step 3"
              title="POST /api/captcha/verify"
            >
              Honeypot + timing + optional Turnstile +{" "}
              <CodeChip>verifyMathAnswer</CodeChip>. Token is single-use
              (deleted).
            </FlowNode>
            <FlowArrow />
            <FlowNode tone="server" eyebrow="Step 4" title="Issue humanPass">
              Short-lived HMAC cookie / JWT gates{" "}
              <CodeChip>/api/login</CodeChip> and{" "}
              <CodeChip>/api/checkout</CodeChip>.
            </FlowNode>
          </div>
        </div>
      </div>
    </div>
  );
}
