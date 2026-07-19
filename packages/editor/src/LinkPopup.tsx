import { useState, useRef, useEffect, useCallback, type FC } from "react";
import type { Editor } from "@tiptap/react";
import { Check, Trash2 } from "lucide-react";

import { validateLinkHref } from "./security";
import type { EditorLocaleText } from "./locale";

interface LinkPopupProps {
  editor: Editor;
  onClose: () => void;
  locale: EditorLocaleText;
}

export const LinkPopup: FC<LinkPopupProps> = ({ editor, onClose, locale }) => {
  const [url, setUrl] = useState(() => editor.getAttributes("link").href ?? "");
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const apply = useCallback(() => {
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      onClose();
      return;
    }
    const result = validateLinkHref(url);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    editor
      .chain()
      .focus()
      .setLink({
        href: result.href,
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      })
      .run();
    onClose();
  }, [editor, url, onClose]);

  const remove = useCallback(() => {
    editor.chain().focus().unsetLink().run();
    onClose();
  }, [editor, onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={locale.link}
      className="absolute top-10 left-0 z-50 flex min-w-[min(100vw-2rem,320px)] flex-col gap-1.5 rounded-lg border border-[var(--editor-border)] bg-[var(--editor-bg)] p-2 shadow-xl"
    >
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="url"
          placeholder={locale.linkPlaceholder}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply();
          }}
          className="h-8 flex-1 rounded-md border border-[var(--editor-border)] bg-[var(--editor-surface)] px-3 font-mono text-sm text-[var(--editor-fg)] outline-none focus:border-[var(--editor-accent)] focus:ring-2 focus:ring-[var(--editor-ring)]"
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={apply}
          className="itzsa-editor-btn-primary flex size-8 items-center justify-center rounded-md transition-colors"
          aria-label={locale.link}
        >
          <Check size={13} />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={remove}
            className="flex size-8 items-center justify-center rounded-md bg-[var(--editor-danger-bg)] text-[var(--editor-danger)] transition-colors"
            aria-label={locale.unlink}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {error && (
        <p className="px-1 text-[11px] text-[var(--editor-danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
