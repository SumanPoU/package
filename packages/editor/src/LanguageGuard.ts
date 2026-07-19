import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// ─── Unicode helpers ──────────────────────────────────────────────────────────

/**
 * Returns true if `text` contains at least one character that is *forbidden*
 * for the given language lock.
 *
 *  'en'  → forbids Devanagari (U+0900–U+097F) + Vedic/extended Devanagari
 *  'ne'  → forbids Basic Latin letters A–Z / a–z only
 *
 * Shared characters (digits, punctuation, whitespace) are never blocked.
 */
function hasForbidden(text: string, language: "en" | "ne"): boolean {
  if (language === "en") {
    return /[\u0900-\u097F\u1CD0-\u1CFF\uA8E0-\uA8FF]/.test(text);
  }
  // 'ne': block plain Latin letters; leave digits/punctuation/symbols alone
  return /[A-Za-z]/.test(text);
}

/**
 * Strips forbidden characters from pasted text so the valid portion still lands.
 */
function stripForbidden(text: string, language: "en" | "ne"): string {
  if (language === "en") {
    return text.replace(/[\u0900-\u097F\u1CD0-\u1CFF\uA8E0-\uA8FF]/g, "");
  }
  return text.replace(/[A-Za-z]/g, "");
}

// ─── Extension ────────────────────────────────────────────────────────────────

export interface LanguageGuardOptions {
  /**
   * Which script this field is locked to.
   * Derived automatically from the `nepali` prop:
   *   nepali truthy  → 'ne'
   *   nepali falsy   → 'en'
   */
  language: "en" | "ne";

  /**
   * Fired whenever input is blocked/stripped.
   * Use it to show a transient warning in the editor UI.
   */
  onBlocked?: (reason: "keystroke" | "paste") => void;
}

const pluginKey = new PluginKey("languageGuard");

export const LanguageGuard = Extension.create<LanguageGuardOptions>({
  name: "languageGuard",

  addOptions() {
    return {
      language: "en",
      onBlocked: undefined,
    };
  },

  addProseMirrorPlugins() {
    const { language, onBlocked } = this.options;

    return [
      new Plugin({
        key: pluginKey,

        props: {
          // ── Block individual keystrokes ─────────────────────────────
          handleKeyDown(_view, event) {
            // Only printable single characters
            if (event.key.length !== 1) return false;
            // Never block shortcuts (Ctrl-C, Cmd-V, etc.)
            if (event.ctrlKey || event.metaKey || event.altKey) return false;

            if (hasForbidden(event.key, language)) {
              onBlocked?.("keystroke");
              return true; // consumed — keystroke is dropped
            }
            return false;
          },

          // ── Filter paste ────────────────────────────────────────────
          handlePaste(view, event) {
            const clipboard = event.clipboardData;
            if (!clipboard) return false;

            const rawText = clipboard.getData("text/plain");
            if (!hasForbidden(rawText, language)) return false; // clean, let TipTap handle

            event.preventDefault();

            const clean = stripForbidden(rawText, language);
            if (clean.length > 0) {
              const { state, dispatch } = view;
              dispatch(state.tr.insertText(clean));
            }

            onBlocked?.("paste");
            return true;
          },
        },
      }),
    ];
  },
});
