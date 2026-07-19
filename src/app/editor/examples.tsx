"use client";

import { useRef, useState } from "react";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@itzsa/editor";
import type { NepaliInputMode } from "@itzsa/nepali-input";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODES: Array<{ id: NepaliInputMode | false; label: string }> = [
  { id: false, label: "English" },
  { id: "unicode", label: "Unicode" },
  { id: "preeti", label: "Preeti" },
];

export function EditorDemo() {
  const ref = useRef<RichTextEditorHandle>(null);
  const [html, setHtml] = useState(
    "<p>Start writing — try the toolbar, or switch Nepali mode below.</p>",
  );
  const [nepali, setNepali] = useState<NepaliInputMode | false>("unicode");

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
        allowBase64
        placeholder="Start writing…"
      />
      <p className={cn("font-mono text-[11px] text-tertiary")}>
        {html.length} chars HTML · use Clear / Focus via ref API
      </p>
    </div>
  );
}
