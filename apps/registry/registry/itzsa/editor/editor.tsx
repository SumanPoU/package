/**
 * REGISTRY NOTE — placeholder
 * ---------------------------------------------------------------------------
 * `packages/editor` is not in this monorepo yet. This file exists so the
 * registry item builds. When @itzsa/editor is added, `sync-from-packages.mjs`
 * will copy real sources from packages/editor/src and overwrite this stub.
 *
 * Do not treat this stub as a production editor.
 */
"use client";

export type EditorProps = {
  className?: string;
  placeholder?: string;
};

export function Editor({ className, placeholder = "Editor coming soon…" }: EditorProps) {
  return (
    <div
      className={className}
      data-itzsa-editor-stub=""
      style={{
        border: "1px dashed currentColor",
        borderRadius: 8,
        opacity: 0.6,
        padding: 16,
        fontFamily: "ui-monospace, monospace",
        fontSize: 13,
      }}
    >
      {placeholder}
    </div>
  );
}
