"use client";

import {
  type Block,
  type BlockRegistry,
  blockSelector,
  type CustomScript,
  type LocaleConfig,
  type Page,
} from "@itzsa/page-builder";
import { Braces, Check, Copy } from "lucide-react";
import { useLayoutEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CustomScriptEditor,
  normalizeCustomScript,
} from "./custom-script-editor";
import { formatCss, formatJson } from "./format-code";
import {
  serializeBlockCss,
  serializeBlockHtml,
  serializePageBodyHtml,
  serializePageCss,
  serializePageHtml,
  serializePageJson,
} from "./serialize-markup";

type PageTab = "css" | "html" | "full" | "global" | "globalJs" | "json";
type BlockTab = "css" | "html" | "json";

const CodeTabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex flex-wrap rounded border border-gray-200 p-0.5">
    {tabs.map((t) => (
      <button
        key={t.id}
        type="button"
        onClick={() => onChange(t.id)}
        className={cn(
          "rounded px-2 py-0.5 text-[10px] font-medium",
          value === t.id
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-800",
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          // no-op
        }
      }}
      aria-label="Copy code"
      className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
};

const CodePre = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => (
  <pre
    className={cn(
      "overflow-auto rounded-lg border border-gray-800 bg-[#0b1220] p-3 font-mono text-[10px] leading-relaxed whitespace-pre text-emerald-300/95 shadow-inner",
      className,
    )}
  >
    {children}
  </pre>
);

export function BlockCodePanel({
  block,
  registry,
  localeConfig,
  locale,
}: {
  block: Block;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  locale: string;
}) {
  const [tab, setTab] = useState<BlockTab>("css");
  const [html, setHtml] = useState("<!-- rendering… -->");

  const css = useMemo(() => serializeBlockCss(block), [block]);
  const json = useMemo(() => formatJson(block), [block]);

  useLayoutEffect(() => {
    setHtml(serializeBlockHtml(block, registry, localeConfig, locale));
  }, [block, registry, localeConfig, locale]);

  const text = tab === "css" ? css : tab === "html" ? html : json;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Braces className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span
              className="block truncate font-mono text-[10px] text-accent"
              title={blockSelector(block.id)}
            >
              {blockSelector(block.id)}
            </span>
          </div>
        </div>
        <CopyButton text={text} />
      </div>
      <CodeTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "css", label: "CSS" },
          { id: "html", label: "HTML" },
          { id: "json", label: "JSON" },
        ]}
      />
      <CodePre className="max-h-56">{text}</CodePre>
      <p className="text-[10px] text-gray-400">
        Formatted {tab.toUpperCase()} for this block. CSS matches canvas /
        preview / open page.
      </p>
    </div>
  );
}

export function PageCodePanel({
  page,
  registry,
  localeConfig,
  activeLocale,
  onGlobalCssChange,
  onGlobalJsChange,
}: {
  page: Page;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  onGlobalCssChange: (css: string) => void;
  onGlobalJsChange: (script: CustomScript) => void;
}) {
  const [tab, setTab] = useState<PageTab>("full");
  const [fullHtml, setFullHtml] = useState("<!-- rendering… -->");
  const [bodyHtml, setBodyHtml] = useState("<!-- rendering… -->");

  const css = useMemo(() => serializePageCss(page), [page]);
  const json = useMemo(() => serializePageJson(page), [page]);
  const globalRaw = page.globalCss ?? "";
  const globalJs = normalizeCustomScript(page.globalJs);

  useLayoutEffect(() => {
    setFullHtml(serializePageHtml(page, registry, localeConfig, activeLocale));
    setBodyHtml(
      serializePageBodyHtml(page, registry, localeConfig, activeLocale),
    );
  }, [page, registry, localeConfig, activeLocale]);

  const combinedView = `/* —— CSS —— */\n${css}\n\n/* —— HTML —— */\n${bodyHtml}`;

  const text =
    tab === "css"
      ? css
      : tab === "html"
        ? bodyHtml
        : tab === "full"
          ? fullHtml
          : tab === "json"
            ? json
            : tab === "globalJs"
              ? globalJs.code
              : formatCss(globalRaw);

  const copyText =
    tab === "global" ? globalRaw : tab === "globalJs" ? globalJs.code : text;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <CodeTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "full", label: "HTML + CSS" },
            { id: "html", label: "HTML" },
            { id: "css", label: "CSS" },
            { id: "json", label: "JSON" },
            { id: "global", label: "Global CSS" },
            { id: "globalJs", label: "Global JS" },
          ]}
        />
        <CopyButton text={tab === "html" ? combinedView : copyText} />
      </div>

      {tab === "global" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <textarea
            value={globalRaw}
            onChange={(e) => onGlobalCssChange(e.target.value)}
            spellCheck={false}
            aria-label="Global page CSS"
            placeholder={`/* Page-wide CSS — applied live on the canvas */\n[data-pb-page] {\n  font-family: system-ui, sans-serif;\n}\n\n.b-YOUR_BLOCK_ID {\n  color: tomato;\n}`}
            className="min-h-[280px] flex-1 resize-y rounded-lg border border-border bg-[#0b1220] p-3 font-mono text-[11px] leading-relaxed text-emerald-300/95 outline-none focus:border-accent"
          />
          <p className="text-[10px] text-gray-500">
            Global CSS applies to the whole page (unscoped). Prefer{" "}
            <code className="rounded bg-gray-100 px-1">[data-pb-page]</code> or{" "}
            <code className="rounded bg-gray-100 px-1">.b-*</code> selectors.
            Changes apply immediately on the canvas.
          </p>
          {globalRaw.trim() ? (
            <details className="rounded border border-gray-100 bg-gray-50 p-2">
              <summary className="cursor-pointer text-[11px] font-medium text-gray-600">
                Formatted preview
              </summary>
              <CodePre className="mt-2 max-h-40">
                {formatCss(globalRaw)}
              </CodePre>
            </details>
          ) : null}
        </div>
      ) : tab === "globalJs" ? (
        <CustomScriptEditor
          value={page.globalJs}
          onChange={onGlobalJsChange}
          ariaLabel="Global page JavaScript"
          hint="Scripts run on Preview / Open Page via composePageJs (CSP sandbox). They are not injected into the editor canvas."
          minRows={12}
        />
      ) : tab === "html" ? (
        <>
          <div className="grid min-h-0 flex-1 gap-2 md:grid-cols-2">
            <div className="flex min-h-0 flex-col gap-1">
              <span className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                CSS
              </span>
              <CodePre className="max-h-[50vh] flex-1">{css}</CodePre>
            </div>
            <div className="flex min-h-0 flex-col gap-1">
              <span className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">
                HTML
              </span>
              <CodePre className="max-h-[50vh] flex-1">{bodyHtml}</CodePre>
            </div>
          </div>
          <p className="text-[10px] text-gray-500">
            CSS and HTML side by side. Copy includes both sections.
          </p>
        </>
      ) : (
        <>
          <CodePre className="max-h-[60vh] flex-1">{text}</CodePre>
          <p className="text-[10px] text-gray-500">
            {tab === "css"
              ? "Composed page CSS (global + all block styles), formatted."
              : tab === "json"
                ? "Canonical Page JSON (schema-validated document that Save / Publish persists)."
                : "Full document with embedded <style> — same blocks as canvas / Open Page."}
          </p>
        </>
      )}
    </div>
  );
}
