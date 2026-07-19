"use client";

import {
  NepaliInput,
  type NepaliInputMode,
  NepaliTextarea,
  toNepali,
} from "@itzsa/nepali-input";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-medium tracking-wide text-secondary"
    >
      {children}
    </label>
  );
}

export function UnicodeExample() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="ne-unicode-name">नाम (Input)</FieldLabel>
        <NepaliInput
          id="ne-unicode-name"
          mode="unicode"
          placeholder="Type Latin… e.g. namaste"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="ne-unicode-note">टिप्पणी (Textarea)</FieldLabel>
        <NepaliTextarea
          id="ne-unicode-note"
          mode="unicode"
          placeholder="Longer text…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
      </div>
      <p className="font-mono text-[12px] text-tertiary">
        value: <span className="text-primary">{name || "—"}</span>
      </p>
    </div>
  );
}

export function PreetiExample() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="ne-preeti">Preeti layout</FieldLabel>
        <NepaliInput
          id="ne-preeti"
          mode="preeti"
          placeholder="Preeti keys… e.g. s = क"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <p className="text-sm text-secondary">
        Output: <span className="text-base text-primary">{value || "—"}</span>
      </p>
    </div>
  );
}

export function ToggleExample() {
  const [enabled, setEnabled] = useState(true);
  const [mode, setMode] = useState<NepaliInputMode>("unicode");
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={enabled ? "primary" : "outline"}
          size="sm"
          onClick={() => setEnabled(true)}
        >
          Nepali on
        </Button>
        <Button
          type="button"
          variant={!enabled ? "primary" : "outline"}
          size="sm"
          onClick={() => setEnabled(false)}
        >
          Plain Latin
        </Button>
        <Button
          type="button"
          variant={mode === "unicode" ? "primary" : "outline"}
          size="sm"
          onClick={() => setMode("unicode")}
        >
          Unicode
        </Button>
        <Button
          type="button"
          variant={mode === "preeti" ? "primary" : "outline"}
          size="sm"
          onClick={() => setMode("preeti")}
        >
          Preeti
        </Button>
      </div>
      <NepaliInput
        mode={mode}
        enabled={enabled}
        placeholder={enabled ? "Transliterating…" : "Normal input"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className={cn("text-[12px] text-tertiary")}>
        mode=<span className="text-accent">{mode}</span> · enabled=
        <span className="text-accent">{String(enabled)}</span>
      </p>
    </div>
  );
}

export function HelperExample() {
  const [latin, setLatin] = useState("namaste");
  const [mode, setMode] = useState<NepaliInputMode>("unicode");
  const result = toNepali(latin, mode);

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "unicode" ? "primary" : "outline"}
          onClick={() => setMode("unicode")}
        >
          unicode
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "preeti" ? "primary" : "outline"}
          onClick={() => setMode("preeti")}
        >
          preeti
        </Button>
      </div>
      <input
        className="h-8 w-full rounded-lg border-[0.5px] border-border bg-transparent px-2.5 font-mono text-sm text-primary outline-none focus-visible:border-accent"
        value={latin}
        onChange={(e) => setLatin(e.target.value)}
        aria-label="Latin source"
      />
      <p className="text-sm text-secondary">
        <code className="font-mono text-accent">toNepali</code>
        {" → "}
        <span className="text-base text-primary">{result || "—"}</span>
      </p>
    </div>
  );
}
