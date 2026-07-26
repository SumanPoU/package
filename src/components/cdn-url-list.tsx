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

function CopyRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [url]);

  return (
    <div className="flex items-stretch gap-2 border-b-[0.5px] border-border px-3 py-2.5 last:border-b-0 sm:px-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
          {label}
        </p>
        <p className="mt-0.5 truncate font-mono text-[12px] text-primary sm:text-[13px]">
          {url}
        </p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? `Copied ${label}` : `Copy ${label} URL`}
        title={copied ? "Copied" : "Copy"}
        className="inline-flex size-8 shrink-0 items-center justify-center self-center rounded-md text-secondary transition-colors hover:bg-muted hover:text-primary"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

export type CdnAsset = { label: string; url: string };

/**
 * Copyable CDN asset URLs (CSS / JS / optional snippet).
 */
export function CdnUrlList({
  assets,
  className,
}: {
  assets: CdnAsset[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-[0.5px] border-border bg-card",
        className,
      )}
    >
      {assets.map((asset) => (
        <CopyRow key={asset.url} label={asset.label} url={asset.url} />
      ))}
    </div>
  );
}
