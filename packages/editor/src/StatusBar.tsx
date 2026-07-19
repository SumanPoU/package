import { useEditorState, type Editor } from "@tiptap/react";
import type { NepaliInputMode } from "@itzsa/nepali-input";

import { cn } from "./lib/utils";
import type { EditorLocaleText } from "./locale";

interface StatusBarProps {
  editor: Editor;
  nepali?: NepaliInputMode | false;
  maxLength?: number;
  locale: EditorLocaleText;
  className?: string;
}

export function StatusBar({
  editor,
  nepali,
  maxLength,
  locale,
  className,
}: StatusBarProps) {
  const state = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor;
      const text = e.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = e.storage.characterCount?.characters?.() ?? text.length;
      let block = "Paragraph";
      for (let l = 1; l <= 6; l++) {
        if (e.isActive("heading", { level: l })) {
          block = `H${l}`;
          break;
        }
      }
      if (e.isActive("blockquote")) block = "Blockquote";
      if (e.isActive("codeBlock")) block = "Code block";
      if (e.isActive("bulletList")) block = "Bullet list";
      if (e.isActive("orderedList")) block = "Ordered list";
      if (e.isActive("taskList")) block = "Task list";
      return { words, chars, block };
    },
  });

  return (
    <div
      className={cn(
        "itzsa-editor-status flex items-center gap-3 border-t px-4 py-2 text-xs font-medium select-none",
        className,
      )}
    >
      <span>
        {state.words} {state.words === 1 ? locale.word : locale.words}
      </span>
      <span className="h-3 w-px bg-[var(--editor-border)]" />
      <span>
        {state.chars}
        {typeof maxLength === "number" ? ` / ${maxLength}` : ""}{" "}
        {state.chars === 1 ? locale.character : locale.characters}
      </span>
      <span className="ml-auto flex items-center gap-2">
        {nepali === "unicode" && (
          <span className="inline-flex items-center rounded-full border border-[var(--editor-border)] bg-[var(--editor-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--editor-accent)]">
            Unicode
          </span>
        )}
        {nepali === "preeti" && (
          <span className="inline-flex items-center rounded-full border border-[var(--editor-border)] bg-[var(--editor-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--editor-accent)]">
            Preeti
          </span>
        )}
        <span className="text-[var(--editor-muted)]">{state.block}</span>
      </span>
    </div>
  );
}
