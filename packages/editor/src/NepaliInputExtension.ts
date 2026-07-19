import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import {
  type NepaliInputMode,
  unicodeMappings,
  preetiMappings,
} from '@itzsa/nepali-input';

function getMapped(key: string, mode: NepaliInputMode): string | null {
  if (key.length !== 1) return null;
  const code = key.charCodeAt(0);
  if (code < 32 || code > 126) return null;
  const map = mode === 'preeti' ? preetiMappings : unicodeMappings;
  return map[code - 32] ?? null;
}

export const createNepaliInputExtension = (mode: NepaliInputMode = 'unicode') =>
  Extension.create({
    name: 'nepaliInput',

    addOptions() {
      return { mode };
    },

    addProseMirrorPlugins() {
      const inputMode = this.options.mode as NepaliInputMode;
      const editor = this.editor;

      return [
        new Plugin({
          props: {
            handleKeyDown(_view, event: KeyboardEvent): boolean {
              // Let all modifier combos through — keeps Ctrl+B, Ctrl+Z etc.
              if (event.ctrlKey || event.metaKey || event.altKey) return false;
              // Only intercept single printable characters
              if (event.key.length !== 1) return false;

              const nepali = getMapped(event.key, inputMode);
              if (nepali === null) return false;

              event.preventDefault();
              editor.commands.insertContent(nepali);
              return true;
            },
          },
        }),
      ];
    },
  });
