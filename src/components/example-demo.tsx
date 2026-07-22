"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Tab = "preview" | "code";

export type ExampleDemoSize = "sm" | "md" | "lg" | "xl";

/** Max height for the scrollable code pane (and tall previews). */
const MAX_H: Record<ExampleDemoSize, string> = {
  sm: "max-h-[16rem]",
  md: "max-h-[22rem]",
  lg: "max-h-[28rem]",
  xl: "max-h-[34rem]",
};

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
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
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
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

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      title={copied ? "Copied" : "Copy"}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-secondary transition-colors hover:bg-page hover:text-primary",
        className,
      )}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

/**
 * Preview / Code demo — height follows content in Preview;
 * Code (and oversized Preview) scroll inside a max-height so the page stays calm.
 */
export function ExampleDemo({
  code,
  children,
  className,
  defaultTab = "preview",
  language = "tsx",
  size = "md",
  /** Extra classes for the preview panel (e.g. overflow-visible for popovers). */
  previewClassName,
}: {
  code: string;
  children: ReactNode;
  className?: string;
  defaultTab?: Tab;
  language?: string;
  size?: ExampleDemoSize;
  previewClassName?: string;
}) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const trimmed = code.trim();

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl border-[0.5px] border-border bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--border)_80%,transparent)]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b-[0.5px] border-border bg-muted/50 px-2 py-1.5 sm:px-2.5">
        <div
          role="tablist"
          aria-label="Example view"
          className="inline-flex items-center gap-0.5 rounded-lg p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => setTab("preview")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
              tab === "preview"
                ? "border-[0.5px] border-border bg-page text-primary shadow-sm"
                : "text-secondary hover:text-primary",
            )}
          >
            <EyeIcon />
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "code"}
            onClick={() => setTab("code")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors",
              tab === "code"
                ? "border-[0.5px] border-border bg-page text-primary shadow-sm"
                : "text-secondary hover:text-primary",
            )}
          >
            <CodeIcon />
            Code
          </button>
        </div>
        <CopyButton text={trimmed} />
      </div>

      {tab === "preview" ? (
        <div
          role="tabpanel"
          className={cn(
            "example-demo-scroll min-w-0 overflow-auto bg-page p-4 sm:p-5",
            MAX_H[size],
            previewClassName,
          )}
        >
          <div className="w-full max-w-full min-w-0">{children}</div>
        </div>
      ) : (
        <div
          role="tabpanel"
          className={cn(
            "example-demo-scroll min-w-0 overflow-auto bg-card",
            MAX_H[size],
          )}
        >
          <pre
            data-language={language}
            className="m-0 p-4 text-[12.5px] leading-relaxed text-primary sm:p-5 sm:text-[13px]"
          >
            <code className="font-mono whitespace-pre">{trimmed}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
