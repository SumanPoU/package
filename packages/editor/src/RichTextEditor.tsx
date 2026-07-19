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
import { mergeLocale } from "./locale";
import { sanitizeHtml, validateMediaInsert } from "./security";
import {
  resolveEditorSettings,
  type EditorSettings,
} from "./settings";
import {
  DEFAULT_TOOLBAR_FEATURES,
  type EditorClassNames,
  type EditorToolbarFeatures,
  type MediaModalType,
  type RichTextEditorHandle,
} from "./types";
import type { EditorUploadHandler } from "./upload";

export type { RichTextEditorHandle } from "./types";

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  minHeight?: string;
  compact?: boolean;
  className?: string;
  classNames?: EditorClassNames;
  nepali?: NepaliInputMode | false;
  maxLength?: number;
  showStatusBar?: boolean;
  allowHtmlMode?: boolean;
  /**
   * Host upload handler — required for device file uploads.
   * Prefer `settings.media.onUpload` for production apps.
   */
  onUpload?: EditorUploadHandler;
  /**
   * @deprecated Use `settings.media.maxImageBytes` / `maxVideoBytes`.
   */
  maxUploadBytes?: number;
  toolbar?: EditorToolbarFeatures;
  locale?: EditorSettings["locale"];
  extensions?: Extensions;
  sanitize?: boolean;
  immediatelyRender?: boolean;
  /**
   * Scalable settings bag (media upload, limits, toolbar, locale, …).
   * Flat props still work and merge on top of / alongside this.
   */
  settings?: EditorSettings;
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
    compact,
    className,
    classNames,
    nepali,
    maxLength,
    showStatusBar,
    allowHtmlMode,
    onUpload,
    maxUploadBytes,
    toolbar: toolbarFeatures,
    locale: localeOverrides,
    extensions,
    sanitize,
    immediatelyRender,
    settings,
  },
  ref,
) {
  const resolved = useMemo(
    () =>
      resolveEditorSettings(settings, {
        placeholder,
        nepali,
        maxLength,
        minHeight,
        compact,
        showStatusBar,
        allowHtmlMode,
        sanitize,
        immediatelyRender,
        toolbar: toolbarFeatures,
        classNames,
        locale: localeOverrides,
        extensions,
        onUpload,
        maxUploadBytes,
      }),
    [
      settings,
      placeholder,
      nepali,
      maxLength,
      minHeight,
      compact,
      showStatusBar,
      allowHtmlMode,
      sanitize,
      immediatelyRender,
      toolbarFeatures,
      classNames,
      localeOverrides,
      extensions,
      onUpload,
      maxUploadBytes,
    ],
  );

  const locale = useMemo(
    () =>
      mergeLocale({
        ...resolved.locale,
        ...(resolved.placeholder ? { placeholder: resolved.placeholder } : {}),
      }),
    [resolved.locale, resolved.placeholder],
  );

  const features = useMemo(
    () => ({
      ...DEFAULT_TOOLBAR_FEATURES,
      ...resolved.toolbar,
      html: resolved.allowHtmlMode && (resolved.toolbar?.html ?? true),
    }),
    [resolved.toolbar, resolved.allowHtmlMode],
  );

  const [mediaModal, setMediaModal] = useState<MediaModalType>(null);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const resolvedMinHeight =
    resolved.minHeight ?? (resolved.compact ? "160px" : "480px");
  const editable = !disabled && !readOnly;

  const editor = useEditorConfig({
    content: value,
    placeholder: locale.placeholder,
    editable,
    minHeight: resolvedMinHeight,
    nepali: resolved.nepali,
    onLanguageBlock: handleLanguageBlock,
    maxLength: resolved.maxLength,
    allowBase64: false,
    extensions: resolved.extensions,
    sanitize: resolved.sanitize,
    immediatelyRender: resolved.immediatelyRender,
  });

  const applyContent = useCallback(
    (html: string, emitUpdate: boolean): string => {
      if (!editor) return "";
      const next = resolved.sanitize
        ? sanitizeHtml(html, {
            allowDataImage: false,
            preserveEmpty: true,
          })
        : html;
      const normalized = next || "";
      editor.commands.setContent(normalized, { emitUpdate });
      return editor.isEmpty ? "" : editor.getHTML();
    },
    [editor, resolved.sanitize],
  );

  const lastPushed = useRef<string>(value);
  useEffect(() => {
    if (!editor) return;
    if (value !== lastPushed.current && value !== editor.getHTML()) {
      lastPushed.current = applyContent(value, false);
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
        lastPushed.current = applyContent(html, options?.emitUpdate ?? true);
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
    if (!editor || !resolved.allowHtmlMode) return;
    if (!htmlMode) {
      setHtmlMode(true);
    } else {
      const html = htmlRef.current?.value ?? "";
      lastPushed.current = applyContent(html, true);
      setHtmlMode(false);
    }
  }, [editor, htmlMode, resolved.allowHtmlMode, applyContent]);

  const handleInsertMedia = useCallback(
    (src: string, width?: string) => {
      if (!editor || !mediaModal) return;
      const result = validateMediaInsert({
        src,
        width,
        kind: mediaModal,
        allowBase64: false,
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
    [editor, mediaModal],
  );

  const handleInsertTable = useCallback(
    (rows: number, cols: number) => {
      if (!editor) return;
      const r = Math.max(1, Math.min(20, rows));
      const c = Math.max(1, Math.min(20, cols));
      editor
        .chain()
        .focus()
        .insertTable({ rows: r, cols: c, withHeaderRow: true })
        .run();
    },
    [editor],
  );

  const rootClassNames = resolved.classNames;

  if (!mounted || !editor) {
    return (
      <div
        className={cn(
          "itzsa-editor flex min-h-[120px] items-center justify-center border border-[var(--editor-border)] text-sm text-[var(--editor-muted)]",
          className,
          rootClassNames?.root,
        )}
        style={{ minHeight: resolvedMinHeight }}
        aria-busy="true"
        aria-label={label}
      >
        Loading editor…
      </div>
    );
  }

  const currentHtml = editor.isEmpty ? "" : editor.getHTML();
  const limitHit =
    typeof resolved.maxLength === "number" &&
    (editor.storage.characterCount?.characters?.() ?? 0) >= resolved.maxLength;

  return (
    <>
      <div
        className={cn(
          "itzsa-editor flex flex-col overflow-hidden border shadow-sm",
          invalid &&
            "ring-2 ring-[var(--editor-danger)] border-[var(--editor-danger)]",
          disabled && "opacity-60 pointer-events-none",
          readOnly && "itzsa-editor-readonly",
          className,
          rootClassNames?.root,
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
            className={rootClassNames?.toolbar}
          />
        )}

        {flashVisible && (
          <div
            role="alert"
            aria-live="assertive"
            className="itzsa-editor-flash flex items-center gap-2 border-b px-4 py-2 text-xs font-medium"
          >
            <CircleAlert className="size-4 shrink-0" />
            {resolved.nepali
              ? locale.languageBlockNe
              : locale.languageBlockEn}
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
          <div className={cn("flex flex-1 flex-col", rootClassNames?.htmlPanel)}>
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
              className="itzsa-editor-html-input w-full flex-1 resize-none px-4 py-4 font-mono text-sm leading-relaxed outline-none"
              style={{ minHeight: resolvedMinHeight }}
              spellCheck={false}
              aria-label={locale.htmlMode}
            />
          </div>
        ) : (
          <div
            className={cn(
              resolved.compact
                ? "px-3 py-3 sm:px-4"
                : "px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-9",
              rootClassNames?.content,
            )}
          >
            <EditorContent editor={editor} />
          </div>
        )}

        {resolved.showStatusBar && !htmlMode && (
          <StatusBar
            editor={editor}
            nepali={resolved.nepali}
            maxLength={resolved.maxLength}
            locale={locale}
            className={rootClassNames?.statusBar}
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
          media={resolved.media}
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
