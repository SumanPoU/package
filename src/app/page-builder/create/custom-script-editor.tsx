"use client";

import type { CustomScript } from "@itzsa/page-builder";
import { cn } from "@/lib/utils";

const EMPTY_SCRIPT: CustomScript = {
  code: "",
  runAt: "domReady",
  enabled: true,
};

export const normalizeCustomScript = (
  value: CustomScript | CustomScript[] | undefined,
): CustomScript => {
  if (!value) return { ...EMPTY_SCRIPT };
  const first = Array.isArray(value) ? value[0] : value;
  if (!first) return { ...EMPTY_SCRIPT };
  return {
    code: typeof first.code === "string" ? first.code : "",
    runAt: first.runAt === "afterHydration" ? "afterHydration" : "domReady",
    enabled: first.enabled !== false,
  };
};

type CustomScriptEditorProps = {
  value: CustomScript | CustomScript[] | undefined;
  onChange: (script: CustomScript) => void;
  ariaLabel: string;
  placeholder?: string;
  hint?: string;
  className?: string;
  minRows?: number;
};

/** Shared controls for page globalJs / block customJs. */
export const CustomScriptEditor = ({
  value,
  onChange,
  ariaLabel,
  placeholder = `// Runs on Preview / Open Page (not on the canvas)\ndocument.querySelector("[data-pb-page]")?.classList.add("ready");`,
  hint,
  className,
  minRows = 10,
}: CustomScriptEditorProps) => {
  const script = normalizeCustomScript(value);

  const handlePatch = (patch: Partial<CustomScript>) => {
    onChange({ ...script, ...patch });
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <input
            type="checkbox"
            checked={script.enabled}
            onChange={(e) => handlePatch({ enabled: e.target.checked })}
            aria-label="Enable script"
            className="accent-[var(--accent,#1d9e75)]"
          />
          Enabled
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
          <span className="text-gray-500">Run at</span>
          <select
            value={script.runAt}
            onChange={(e) =>
              handlePatch({
                runAt:
                  e.target.value === "afterHydration"
                    ? "afterHydration"
                    : "domReady",
              })
            }
            aria-label="Script run timing"
            className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] outline-none focus:border-accent"
          >
            <option value="domReady">DOM ready</option>
            <option value="afterHydration">After hydration</option>
          </select>
        </label>
      </div>
      <textarea
        value={script.code}
        onChange={(e) => handlePatch({ code: e.target.value })}
        spellCheck={false}
        aria-label={ariaLabel}
        placeholder={placeholder}
        rows={minRows}
        disabled={!script.enabled}
        className="min-h-[160px] flex-1 resize-y rounded-lg border border-border bg-[#0b1220] p-3 font-mono text-[11px] leading-relaxed text-emerald-300/95 outline-none focus:border-accent disabled:opacity-50"
      />
      {hint ? (
        <p className="text-[10px] leading-relaxed text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
};
