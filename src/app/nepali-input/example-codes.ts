export const UNICODE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import { NepaliInput, NepaliTextarea } from "@itzsa/nepali-input";

export function UnicodeExample() {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  return (
    <div>
      <label htmlFor="ne-name">नाम (Input)</label>
      <NepaliInput
        id="ne-name"
        mode="unicode"
        placeholder="Type Latin… e.g. namaste"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="ne-note">टिप्पणी (Textarea)</label>
      <NepaliTextarea
        id="ne-note"
        mode="unicode"
        placeholder="Longer text…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
      />

      <p>value: {name || "—"}</p>
    </div>
  );
}`;

export const PREETI_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import { NepaliInput } from "@itzsa/nepali-input";

export function PreetiExample() {
  const [value, setValue] = useState("");

  return (
    <div>
      <label htmlFor="ne-preeti">Preeti layout</label>
      <NepaliInput
        id="ne-preeti"
        mode="preeti"
        placeholder="Preeti keys… e.g. s = क"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>Output: {value || "—"}</p>
    </div>
  );
}`;

export const TOGGLE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  NepaliInput,
  type NepaliInputMode,
} from "@itzsa/nepali-input";

export function ToggleExample() {
  const [enabled, setEnabled] = useState(true);
  const [mode, setMode] = useState<NepaliInputMode>("unicode");
  const [value, setValue] = useState("");

  return (
    <div>
      <button type="button" onClick={() => setEnabled(true)}>
        Nepali on
      </button>
      <button type="button" onClick={() => setEnabled(false)}>
        Plain Latin
      </button>
      <button type="button" onClick={() => setMode("unicode")}>
        Unicode
      </button>
      <button type="button" onClick={() => setMode("preeti")}>
        Preeti
      </button>

      <NepaliInput
        mode={mode}
        enabled={enabled}
        placeholder={enabled ? "Transliterating…" : "Normal input"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p>
        mode={mode} · enabled={String(enabled)}
      </p>
    </div>
  );
}`;

export const HELPER_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import { toNepali, type NepaliInputMode } from "@itzsa/nepali-input";

export function HelperExample() {
  const [latin, setLatin] = useState("namaste");
  const [mode, setMode] = useState<NepaliInputMode>("unicode");
  const result = toNepali(latin, mode);

  return (
    <div>
      <button type="button" onClick={() => setMode("unicode")}>
        unicode
      </button>
      <button type="button" onClick={() => setMode("preeti")}>
        preeti
      </button>
      <input
        value={latin}
        onChange={(e) => setLatin(e.target.value)}
        aria-label="Latin source"
      />
      <p>
        toNepali → {result || "—"}
      </p>
    </div>
  );
}`;
