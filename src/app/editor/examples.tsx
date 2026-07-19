"use client";

import {
  type EditorUploadHandler,
  RichTextEditor,
  type RichTextEditorHandle,
} from "@itzsa/editor";
import type { NepaliInputMode } from "@itzsa/nepali-input";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODES: Array<{ id: NepaliInputMode | false; label: string }> = [
  { id: false, label: "English" },
  { id: "unicode", label: "Unicode" },
  { id: "preeti", label: "Preeti" },
];

/** Demo uploader — replace with your CDN/API in production. */
const demoUpload: EditorUploadHandler = async (
  file,
  { signal, onProgress },
) => {
  // Simulate progress while "uploading"
  for (let i = 1; i <= 5; i++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    await new Promise((r) => setTimeout(r, 80));
    onProgress({ ratio: i / 5 });
  }
  // Return a durable https URL (never data:/base64)
  const seed = encodeURIComponent(file.name.slice(0, 24) || "img");
  return `https://picsum.photos/seed/${seed}/800/450`;
};

export function EditorDemo() {
  const ref = useRef<RichTextEditorHandle>(null);
  const [html, setHtml] = useState(
    "<p>Start writing — try the toolbar, or switch Nepali mode below.</p>",
  );
  const [nepali, setNepali] = useState<NepaliInputMode | false>("unicode");

  const onUpload = useCallback<EditorUploadHandler>((file, ctx) => {
    return demoUpload(file, ctx);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {MODES.map((m) => (
          <Button
            key={String(m.id)}
            type="button"
            size="sm"
            variant={nepali === m.id ? "primary" : "outline"}
            onClick={() => setNepali(m.id)}
          >
            {m.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => ref.current?.clear()}
        >
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => ref.current?.focus()}
        >
          Focus
        </Button>
      </div>
      <RichTextEditor
        ref={ref}
        value={html}
        onChange={setHtml}
        nepali={nepali}
        compact
        minHeight="280px"
        maxLength={8000}
        onUpload={onUpload}
        settings={{
          media: {
            maxImageBytes: 5 * 1024 * 1024,
            maxVideoBytes: 50 * 1024 * 1024,
          },
        }}
        placeholder="Start writing…"
      />
      <p className={cn("font-mono text-[11px] text-tertiary")}>
        Uploads use <code className="text-primary">onUpload</code> → https URL
        (no base64)
      </p>
    </div>
  );
}
