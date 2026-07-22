"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

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

export function CodeBlock({
  code,
  language = "tsx",
  className,
  showPrompt = false,
  showCopy = true,
}: {
  code: string;
  language?: string;
  className?: string;
  /** Prefix first line with a muted `$` (CLI style). */
  showPrompt?: boolean;
  /** Show the upper-right copy control (default true). */
  showCopy?: boolean;
}) {
  const trimmed = code.trim();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [trimmed]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border-[0.5px] border-border bg-card",
        className,
      )}
    >
      {showCopy ? (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          title={copied ? "Copied" : "Copy"}
          className="absolute top-2 right-2 z-10 inline-flex size-7 items-center justify-center rounded-md border-[0.5px] border-border bg-page/90 text-secondary shadow-sm backdrop-blur-sm transition-colors hover:bg-muted hover:text-primary"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      ) : null}
      <pre
        data-language={language}
        className={cn(
          "data-table-thin-scroll overflow-x-auto p-3.5 text-[13px] leading-relaxed text-primary sm:p-4",
          showCopy && "pr-12 sm:pr-12",
        )}
      >
        <code className="font-mono whitespace-pre">
          {showPrompt ? (
            <>
              <span className="text-tertiary select-none">$ </span>
              {trimmed}
            </>
          ) : (
            trimmed
          )}
        </code>
      </pre>
    </div>
  );
}
