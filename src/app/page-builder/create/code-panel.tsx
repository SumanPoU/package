"use client";

import type { Block } from "@itzsa/page-builder";
import {
  blockSelector,
  collectBlockStyleCssRules,
  composePageCss,
} from "@itzsa/page-builder";
import { Braces, Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type CodePanelProps = {
  block: Block;
  pageCss?: string;
};

type CodeTab = "css" | "json";

export function BlockCodePanel({ block }: CodePanelProps) {
  const [tab, setTab] = useState<CodeTab>("css");
  const [copied, setCopied] = useState(false);

  const css = useMemo(
    () =>
      collectBlockStyleCssRules(block).join("\n\n") || "/* no styles yet */",
    [block],
  );
  const json = useMemo(() => JSON.stringify(block, null, 2), [block]);
  const text = tab === "css" ? css : json;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <Braces className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-mono text-[10px] text-blue-500">
            {blockSelector(block.id)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex rounded border border-gray-200 p-0.5">
            {(
              [
                ["css", "CSS"],
                ["json", "JSON"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium",
                  tab === id
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-800",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void handleCopy()}
            aria-label="Copy code"
            className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
      <pre className="max-h-56 overflow-auto rounded-lg border border-gray-800 bg-[#0b1220] p-3 font-mono text-[10px] leading-relaxed text-emerald-300/95 shadow-inner">
        {text}
      </pre>
      <p className="text-[10px] text-gray-400">
        Live CSS for this block (style + custom + visibility). Same rules used
        by canvas, preview, and open page.
      </p>
    </div>
  );
}

/** Optional full-page CSS dump for the header code drawer. */
export function PageCodePanel({
  page,
}: {
  page: Parameters<typeof composePageCss>[0];
}) {
  const { css } = useMemo(() => composePageCss(page), [page]);
  return (
    <pre className="max-h-[70vh] overflow-auto rounded-lg border border-gray-800 bg-[#0b1220] p-4 font-mono text-[11px] leading-relaxed text-emerald-300/95">
      {css || "/* empty page CSS */"}
    </pre>
  );
}
