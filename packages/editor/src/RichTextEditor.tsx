import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { EditorContent } from "@tiptap/react";
import type { NepaliInputMode } from "@itzsa/nepali-input";
import type { Extensions } from "@tiptap/core";
import { CircleAlert } from "lucide-react";

import { cn } from "./lib/utils";
import { useEditorConfig } from "./useEditorConfig";
import { EditorToolbar } from "./EditorToolbar";
import { StatusBar } from "./StatusBar";
import { MediaModal } from "./MediaModal";
import { TableModal } from "./TableModal";
import { mergeLocale, type EditorLocaleText } from "./locale";
import { sanitizeHtml, validateMediaInsert } from "./security";
import {
  DEFAULT_TOOLBAR_FEATURES,
  type EditorClassNames,
  type EditorToolbarFeatures,
  type MediaModalType,
  type RichTextEditorHandle,
} from "./types";

export type { RichTextEditorHandle } from "./types";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  label?: string;
  /** Greys out and blocks interaction (form disabled). */
  disabled?: boolean;
  /** Editable=false but still selectable/copyable. */
  readOnly?: boolean;
  invalid?: boolean;
  minHeight?: string;
  compact?: boolean;
  className?: string;
  classNames?: EditorClassNames;
  /** Nepali input + language lock. `false` = English-only lock. */
  nepali?: NepaliInputMode | false;
  /** Soft character limit (CharacterCount). */
  maxLength?: number;
  /** Show status bar (default true). */
  showStatusBar?: boolean;
  /** Allow HTML source mode (default true). */
  allowHtmlMode?: boolean;
  /** Allow base64 images (default false — prefer onUpload). */
  allowBase64?: boolean;
  /** Max upload bytes for local FileReader fallback. */
  maxUploadBytes?: number;
  /**
   * Server/CDN upload. When provided, files are uploaded instead of inlined as base64.
   * Return a public https URL.
   */
  onUpload?: (file: File) => Promise<string>;
  /** Toolbar feature flags. */
  toolbar?: EditorToolbarFeatures;
  /** Locale / label overrides. */
  locale?: Partial<EditorLocaleText>;
  /** Extra TipTap extensions (keep reference stable). */
  extensions?: Extensions;
  /** Run HTML sanitizer on ingress (default true). */
  sanitize?: boolean;
}

const FLASH_DURATION_MS = 2500;

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  {
    value = "",
    onChange,
    onBlur,
    onFocus,
    placeholder,
    label,
    disabled = false,
    readOnly = false,
    invalid = false,
    minHeight,
    compact = false,
    className,
    classNames,
    nepali = false,
    maxLength,
    showStatusBar = true,
    allowHtmlMode = true,
    allowBase64 = false,
    maxUploadBytes,
    onUpload,
    toolbar: toolbarFeatures,
    locale: localeOverrides,
    extensions,
    sanitize = true,
  },
  ref,
) {
  const locale = useMemo(
    () => mergeLocale({ ...localeOverrides, ...(placeholder ? { placeholder } : {}) }),
    [localeOverrides, placeholder],
  );

  const features = useMemo(
    () => ({
      ...DEFAULT_TOOLBAR_FEATURES,
      ...toolbarFeatures,
      html: allowHtmlMode && (toolbarFeatures?.html ?? true),
    }),
    [toolbarFeatures, allowHtmlMode],
  );

  const [mediaModal, setMediaModal] = useState<MediaModalType>(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLanguageBlock = useCallback(() => {
    setFlashVisible(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(
      () => setFlashVisible(false),
      FLASH_DURATION_MS,
    );
  }, []);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const resolvedMinHeight = minHeight ?? (compact ? "160px" : "480px");
  const editable = !disabled && !readOnly;

  const editor = useEditorConfig({
    content: value,
    placeholder: locale.placeholder,
    editable,
    minHeight: resolvedMinHeight,
    nepali,
    onLanguageBlock: handleLanguageBlock,
    maxLength,
    allowBase64,
    extensions,
    sanitize,
  });

  const applyContent = useCallback(
    (html: string, emitUpdate: boolean) => {
      if (!editor) return;
      const next = sanitize
        ? sanitizeHtml(html, {
            allowDataImage: allowBase64,
            preserveEmpty: true,
          })
        : html;
      editor.commands.setContent(next || "", { emitUpdate });
    },
    [editor, sanitize, allowBase64],
  );

  const lastPushed = useRef<string>(value);
  useEffect(() => {
    if (!editor) return;
    if (value !== lastPushed.current && value !== editor.getHTML()) {
      applyContent(value, false);
      lastPushed.current = value;
    }
  }, [editor, value, applyContent]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      lastPushed.current = html;
      onChange?.(html);
    };
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, onChange]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || !onBlur) return;
    editor.on("blur", onBlur);
    return () => {
      editor.off("blur", onBlur);
    };
  }, [editor, onBlur]);

  useEffect(() => {
    if (!editor || !onFocus) return;
    editor.on("focus", onFocus);
    return () => {
      editor.off("focus", onFocus);
    };
  }, [editor, onFocus]);

  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => (editor?.isEmpty ? "" : (editor?.getHTML() ?? "")),
      getJSON: () => (editor?.getJSON() as Record<string, unknown>) ?? {},
      getText: () => editor?.getText() ?? "",
      setContent: (html, options) => {
        applyContent(html, options?.emitUpdate ?? true);
        lastPushed.current = html;
      },
      clear: () => {
        editor?.commands.clearContent(true);
        lastPushed.current = "";
      },
      focus: () => editor?.commands.focus(),
      blur: () => editor?.commands.blur(),
      isEmpty: () => editor?.isEmpty ?? true,
      getEditor: () => editor,
    }),
    [editor, applyContent],
  );

  const toggleHtmlMode = useCallback(() => {
    if (!editor || !allowHtmlMode) return;
    if (!htmlMode) {
      setHtmlMode(true);
    } else {
      const html = htmlRef.current?.value ?? "";
      applyContent(html, true);
      lastPushed.current = editor.isEmpty ? "" : editor.getHTML();
      setHtmlMode(false);
    }
  }, [editor, htmlMode, allowHtmlMode, applyContent]);

  const handleInsertMedia = useCallback(
    (src: string, width?: string) => {
      if (!editor || !mediaModal) return;
      const result = validateMediaInsert({
        src,
        width,
        kind: mediaModal,
        allowBase64: allowBase64 && mediaModal === "image",
        maxDataBytes: maxUploadBytes,
      });
      if (!result.ok) {
        setMediaError(result.error);
        return;
      }
      setMediaError(null);
      if (mediaModal === "image") {
        const chain = editor.chain().focus().setImage({ src: result.src });
        if (result.width) {
          chain.updateAttributes("image", { width: result.width });
        }
        chain.run();
      } else {
        editor
          .chain()
          .focus()
          .setVideo({
            src: result.src,
            width: result.width ?? null,
          })
          .run();
      }
      setMediaModal(null);
    },
    [editor, mediaModal, allowBase64, maxUploadBytes],
  );

  const handleInsertTable = useCallback(
    (rows: number, cols: number) => {
      if (!editor) return;
      const r = Math.max(1, Math.min(20, rows));
      const c = Math.max(1, Math.min(20, cols));
      editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run();
    },
    [editor],
  );

  if (!editor) {
    return (
      <div
        className={cn(
          "itzsa-editor flex min-h-[120px] items-center justify-center border border-[var(--editor-border)] text-sm text-[var(--editor-muted)]",
          className,
          classNames?.root,
        )}
        aria-busy="true"
        aria-label={label}
      >
        Loading editor…
      </div>
    );
  }

  const currentHtml = editor.isEmpty ? "" : editor.getHTML();
  const limitHit =
    typeof maxLength === "number" &&
    (editor.storage.characterCount?.characters?.() ?? 0) >= maxLength;

  return (
    <>
      <div
        className={cn(
          "itzsa-editor flex flex-col overflow-hidden border shadow-sm",
          invalid && "ring-2 ring-[var(--editor-danger)] border-[var(--editor-danger)]",
          disabled && "opacity-60 pointer-events-none",
          readOnly && "itzsa-editor-readonly",
          className,
          classNames?.root,
        )}
        aria-label={label}
        aria-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
      >
        {!readOnly && (
          <EditorToolbar
            editor={editor}
            onOpenMedia={setMediaModal}
            onOpenTable={() => setTableModalOpen(true)}
            htmlMode={htmlMode}
            onToggleHtml={toggleHtmlMode}
            features={features}
            locale={locale}
            className={classNames?.toolbar}
          />
        )}

        {flashVisible && (
          <div
            role="alert"
            aria-live="assertive"
            className="itzsa-editor-flash flex items-center gap-2 border-b px-4 py-2 text-xs font-medium"
          >
            <CircleAlert className="size-4 shrink-0" />
            {nepali ? locale.languageBlockNe : locale.languageBlockEn}
          </div>
        )}

        {limitHit && (
          <div
            role="status"
            className="itzsa-editor-flash flex items-center gap-2 border-b px-4 py-1.5 text-xs font-medium"
          >
            {locale.limitReached}
          </div>
        )}

        {htmlMode ? (
          <div className={cn("flex flex-1 flex-col", classNames?.htmlPanel)}>
            <div className="itzsa-editor-html-bar flex items-center justify-between border-b px-4 py-2 font-mono text-xs">
              <span>{locale.htmlBanner}</span>
              <button
                type="button"
                onClick={toggleHtmlMode}
                className="itzsa-editor-btn rounded-md px-3 py-1 text-xs transition-colors"
              >
                {locale.htmlApply}
              </button>
            </div>
            <textarea
              ref={htmlRef}
              defaultValue={currentHtml}
              className="itzsa-editor-html-input flex-1 w-full resize-none px-4 py-4 font-mono text-sm leading-relaxed outline-none"
              style={{ minHeight: resolvedMinHeight }}
              spellCheck={false}
              aria-label={locale.htmlMode}
            />
          </div>
        ) : (
          <div
            className={cn(
              compact ? "px-3 py-3 sm:px-4" : "px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-9",
              classNames?.content,
            )}
          >
            <EditorContent editor={editor} />
          </div>
        )}

        {showStatusBar && !htmlMode && (
          <StatusBar
            editor={editor}
            nepali={nepali}
            maxLength={maxLength}
            locale={locale}
            className={classNames?.statusBar}
          />
        )}
      </div>

      {mediaModal && (
        <MediaModal
          type={mediaModal}
          onClose={() => {
            setMediaModal(null);
            setMediaError(null);
          }}
          onInsert={handleInsertMedia}
          allowBase64={allowBase64}
          maxUploadBytes={maxUploadBytes}
          onUpload={onUpload}
          locale={locale}
          error={mediaError}
        />
      )}
      {tableModalOpen && (
        <TableModal
          onClose={() => setTableModalOpen(false)}
          onInsert={handleInsertTable}
          locale={locale}
        />
      )}
    </>
  );
});

RichTextEditor.displayName = "RichTextEditor";
