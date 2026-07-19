import {
  type NepaliInputMode,
  preetiMappings,
  unicodeMappings,
} from "./mappings";

export type ToNepaliOptions = {
  /**
   * When true (default), characters outside ASCII 32–126 are left unchanged
   * (already-typed Devanagari, emoji, etc. survive).
   */
  passthroughNonAscii?: boolean;
};

function getMap(mode: NepaliInputMode): readonly string[] {
  return mode === "preeti" ? preetiMappings : unicodeMappings;
}

/**
 * Map one Latin/ASCII character to Nepali for the given layout.
 * Returns the original character when it is outside the printable ASCII range
 * or when the map has no entry.
 */
export function mapChar(ch: string, mode: NepaliInputMode = "unicode"): string {
  if (!ch) return ch;
  const code = ch.codePointAt(0);
  if (code === undefined) return ch;
  // Surrogate / multi-codepoint: leave alone
  if (code > 0xffff || ch.length > 1) return ch;
  if (code < 32 || code > 126) return ch;
  return getMap(mode)[code - 32] ?? ch;
}

/**
 * Transliterate a full string with Unicode or Preeti layout.
 * Safe for incremental typing: non-ASCII (existing Devanagari) is preserved.
 */
export function toNepali(
  value: string,
  mode: NepaliInputMode = "unicode",
  options: ToNepaliOptions = {},
): string {
  if (!value) return value;
  const { passthroughNonAscii = true } = options;
  const map = getMap(mode);
  let out = "";

  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code === undefined) {
      out += ch;
      continue;
    }
    if (code < 32 || code > 126) {
      if (passthroughNonAscii) out += ch;
      continue;
    }
    out += map[code - 32] ?? ch;
  }

  return out;
}

/**
 * Given the raw string and caret index before mapping, return the caret
 * index after `toNepali` so the cursor stays on the “same” logical position.
 */
export function mapCaretIndex(
  value: string,
  caret: number,
  mode: NepaliInputMode = "unicode",
): number {
  if (caret <= 0) return 0;
  const safe = Math.min(caret, value.length);
  return toNepali(value.slice(0, safe), mode).length;
}
