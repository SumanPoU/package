import { type Editor, useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CaseLower,
  CaseSensitive,
  CaseUpper,
  ChevronDown,
  Code,
  Code2,
  Columns2,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Menu,
  Minus,
  Quote,
  Redo2,
  Rows2,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCellsMerge,
  Trash2,
  Underline,
  Undo2,
  Video,
  X,
} from "lucide-react";
import { type FC, type ReactNode, useCallback, useState } from "react";
import { ColorPicker } from "./ColorPicker";
import {
  FONT_FAMILIES,
  FONT_SIZES,
  HEADING_FONT_SIZE_MAP,
  HEADING_OPTIONS,
} from "./constants";
import { LinkPopup } from "./LinkPopup";
import { cn } from "./lib/utils";
import type { EditorLocaleText } from "./locale";
import { ToolbarButton, ToolbarLabel, ToolbarSeparator } from "./ToolbarButton";
import type {
  EditorToolbarFeatures,
  HeadingLevel,
  TextAlignValue,
} from "./types";
import { DEFAULT_TOOLBAR_FEATURES } from "./types";

const Tooltip: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && label && (
        <div
          role="tooltip"
          className="pointer-events-none absolute top-full left-1/2 z-[9999] mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--editor-fg)] px-2 py-1 text-[11px] font-medium text-[var(--editor-bg)] shadow-lg"
        >
          {label}
        </div>
      )}
    </div>
  );
};

const ToolbarSelect: FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  widthClass?: string;
  tooltip?: string;
}> = ({ value, onChange, options, widthClass = "w-28", tooltip }) => {
  const el = (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${widthClass} h-8 cursor-pointer appearance-none rounded-md border border-[var(--editor-border)] bg-[var(--editor-surface)] pl-2 pr-6 text-xs font-medium text-[var(--editor-fg)] outline-none transition-colors hover:border-[var(--editor-muted)] focus:border-[var(--editor-accent)] focus:ring-2 focus:ring-[var(--editor-ring)]`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={11}
        className="pointer-events-none absolute right-1.5 text-[var(--editor-muted-fg)]"
      />
    </div>
  );
  return tooltip ? <Tooltip label={tooltip}>{el}</Tooltip> : el;
};

const GL = ToolbarLabel;

interface EditorToolbarProps {
  editor: Editor;
  onOpenMedia: (type: "image" | "video") => void;
  onOpenTable: () => void;
  htmlMode: boolean;
  onToggleHtml: () => void;
  features?: Required<EditorToolbarFeatures>;
  locale: EditorLocaleText;
  className?: string;
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
  editor,
  onOpenMedia,
  onOpenTable,
  htmlMode,
  onToggleHtml,
  features = DEFAULT_TOOLBAR_FEATURES,
  locale,
  className,
}) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const f = features;

  // ── Subscribe to live editor state so dropdowns re-render on cursor move ──
  // useEditorState returns a snapshot that updates whenever the editor state changes.
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor;
      // Heading level
      let headingVal = "p";
      for (let l = 1; l <= 6; l++) {
        if (e.isActive("heading", { level: l })) {
          headingVal = String(l);
          break;
        }
      }
      // textStyle attributes
      const tsAttrs = e.getAttributes("textStyle");
      const explicitSize: string = tsAttrs.fontSize ?? "";
      const fontFamily: string = tsAttrs.fontFamily ?? "";
      const textTransform: string = tsAttrs.textTransform ?? "";
      const color: string = tsAttrs.color ?? "#000000";

      // Font size: explicit inline size wins; else use heading-level default
      const fontSize =
        explicitSize || HEADING_FONT_SIZE_MAP[headingVal] || "16px";

      return {
        headingVal,
        fontSize,
        fontFamily,
        textTransform,
        color,
        isBold: e.isActive("bold"),
        isItalic: e.isActive("italic"),
        isUnderline: e.isActive("underline"),
        isStrike: e.isActive("strike"),
        isHighlight: e.isActive("highlight"),
        isSubscript: e.isActive("subscript"),
        isSuperscript: e.isActive("superscript"),
        isCode: e.isActive("code"),
        isCodeBlock: e.isActive("codeBlock"),
        isLink: e.isActive("link"),
        isBlockquote: e.isActive("blockquote"),
        isBulletList: e.isActive("bulletList"),
        isOrderedList: e.isActive("orderedList"),
        isTaskList: e.isActive("taskList"),
        isTable: e.isActive("table"),
        alignLeft: e.isActive({ textAlign: "left" }),
        alignCenter: e.isActive({ textAlign: "center" }),
        alignRight: e.isActive({ textAlign: "right" }),
        alignJustify: e.isActive({ textAlign: "justify" }),
      };
    },
  });

  const s = editorState;

  // ── Heading ────────────────────────────────────────────────────────────────
  const setHeading = useCallback(
    (val: string) => {
      if (val === "p") editor.chain().focus().setParagraph().run();
      else
        editor
          .chain()
          .focus()
          .setHeading({ level: parseInt(val, 10) as HeadingLevel })
          .run();
    },
    [editor],
  );

  // ── Font size ──────────────────────────────────────────────────────────────
  const setFontSize = useCallback(
    (val: string) => {
      if (!val) editor.chain().focus().unsetFontSize().run();
      else editor.chain().focus().setFontSize(val).run();
    },
    [editor],
  );

  // ── Font family ────────────────────────────────────────────────────────────
  const setFontFamily = useCallback(
    (val: string) => {
      if (!val) editor.chain().focus().unsetFontFamily().run();
      else editor.chain().focus().setFontFamily(val).run();
    },
    [editor],
  );

  // ── Text transform ─────────────────────────────────────────────────────────
  const cycleTransform = useCallback(
    (val: string) => {
      if (s.textTransform === val)
        editor.chain().focus().unsetTextTransform().run();
      else editor.chain().focus().setTextTransform(val).run();
    },
    [editor, s.textTransform],
  );

  const setTextAlign = useCallback(
    (align: TextAlignValue) => {
      editor.chain().focus().setTextAlign(align).run();
    },
    [editor],
  );

  // ── Rows ───────────────────────────────────────────────────────────────────
  const Row1 = () => (
    <div className="flex min-h-[44px] flex-wrap items-center gap-0.5 border-b border-[var(--editor-border)] px-2 py-1.5">
      {f.history && (
        <>
          <Tooltip label={locale.undo}>
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
              <Undo2 size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.redo}>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
              <Redo2 size={14} />
            </ToolbarButton>
          </Tooltip>
          <ToolbarSeparator />
        </>
      )}

      {f.headings && (
        <>
          <ToolbarSelect
            value={s.headingVal}
            onChange={setHeading}
            options={HEADING_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            widthClass="w-[112px]"
            tooltip="Text style"
          />
          <ToolbarSeparator />
        </>
      )}

      {f.fonts && (
        <>
          <ToolbarSelect
            value={s.fontFamily}
            onChange={setFontFamily}
            options={FONT_FAMILIES.map((fam) => ({
              value: fam.value,
              label: fam.label,
            }))}
            widthClass="w-[108px]"
            tooltip="Font family"
          />
          <ToolbarSelect
            value={s.fontSize}
            onChange={setFontSize}
            options={FONT_SIZES.map((sz) => ({ value: sz, label: sz }))}
            widthClass="w-[76px]"
            tooltip="Font size"
          />
          <ToolbarSeparator />
        </>
      )}

      {f.marks && (
        <>
          <Tooltip label={locale.bold}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={s.isBold}
            >
              <Bold size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.italic}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={s.isItalic}
            >
              <Italic size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.underline}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={s.isUnderline}
            >
              <Underline size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.strike}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={s.isStrike}
            >
              <Strikethrough size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.highlight}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              active={s.isHighlight}
            >
              <Highlighter size={14} />
            </ToolbarButton>
          </Tooltip>
          <ToolbarSeparator />
        </>
      )}

      {f.color && (
        <>
          <ColorPicker
            label="Text"
            currentColor={s.color}
            onSelect={(c) => editor.chain().focus().setColor(c).run()}
          />
          <ToolbarSeparator />
        </>
      )}

      {f.transform && (
        <>
          <Tooltip label="UPPERCASE">
            <ToolbarButton
              onClick={() => cycleTransform("uppercase")}
              active={s.textTransform === "uppercase"}
            >
              <CaseUpper size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label="lowercase">
            <ToolbarButton
              onClick={() => cycleTransform("lowercase")}
              active={s.textTransform === "lowercase"}
            >
              <CaseLower size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label="Capitalize">
            <ToolbarButton
              onClick={() => cycleTransform("capitalize")}
              active={s.textTransform === "capitalize"}
            >
              <CaseSensitive size={14} />
            </ToolbarButton>
          </Tooltip>
          <ToolbarSeparator />
        </>
      )}

      {f.script && (
        <>
          <Tooltip label="Subscript">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              active={s.isSubscript}
            >
              <Subscript size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label="Superscript">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              active={s.isSuperscript}
            >
              <Superscript size={14} />
            </ToolbarButton>
          </Tooltip>
          <ToolbarSeparator />
        </>
      )}

      {f.link && (
        <div className="relative">
          <Tooltip label={locale.link}>
            <ToolbarButton
              onClick={() => setLinkOpen((o) => !o)}
              active={s.isLink}
            >
              <Link2 size={14} />
            </ToolbarButton>
          </Tooltip>
          {linkOpen && (
            <LinkPopup
              editor={editor}
              onClose={() => setLinkOpen(false)}
              locale={locale}
            />
          )}
        </div>
      )}

      {f.code && (
        <>
          <Tooltip label={locale.code}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={s.isCode}
            >
              <Code size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.codeBlock}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={s.isCodeBlock}
            >
              <Code2 size={14} />
            </ToolbarButton>
          </Tooltip>
          <ToolbarSeparator />
        </>
      )}

      {f.html && (
        <Tooltip label={htmlMode ? locale.visualMode : locale.htmlMode}>
          <ToolbarButton onClick={onToggleHtml} active={htmlMode}>
            <span className="font-mono text-[11px] leading-none font-bold">
              &lt;/&gt;
            </span>
          </ToolbarButton>
        </Tooltip>
      )}
    </div>
  );

  const Row2 = () => (
    <div className="flex min-h-[44px] flex-wrap items-center gap-0.5 px-2 py-1.5">
      {f.align && (
        <>
          <GL>Align</GL>
          <Tooltip label={locale.alignLeft}>
            <ToolbarButton
              onClick={() => setTextAlign("left")}
              active={s.alignLeft}
            >
              <AlignLeft size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.alignCenter}>
            <ToolbarButton
              onClick={() => setTextAlign("center")}
              active={s.alignCenter}
            >
              <AlignCenter size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.alignRight}>
            <ToolbarButton
              onClick={() => setTextAlign("right")}
              active={s.alignRight}
            >
              <AlignRight size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.alignJustify}>
            <ToolbarButton
              onClick={() => setTextAlign("justify")}
              active={s.alignJustify}
            >
              <AlignJustify size={14} />
            </ToolbarButton>
          </Tooltip>
          <ToolbarSeparator />
        </>
      )}

      {f.lists && (
        <>
          <GL>Lists</GL>
          <Tooltip label={locale.bulletList}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={s.isBulletList}
            >
              <List size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.orderedList}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={s.isOrderedList}
            >
              <ListOrdered size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label={locale.taskList}>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              active={s.isTaskList}
            >
              <ListTodo size={14} />
            </ToolbarButton>
          </Tooltip>
          <ToolbarSeparator />
        </>
      )}

      <GL>Insert</GL>
      {f.quote && (
        <Tooltip label={locale.blockquote}>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={s.isBlockquote}
          >
            <Quote size={14} />
          </ToolbarButton>
        </Tooltip>
      )}
      {f.rule && (
        <Tooltip label={locale.horizontalRule}>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={14} />
          </ToolbarButton>
        </Tooltip>
      )}
      {f.table && (
        <Tooltip label={locale.insertTable}>
          <ToolbarButton onClick={onOpenTable} active={s.isTable}>
            <Table size={14} />
          </ToolbarButton>
        </Tooltip>
      )}
      {f.image && (
        <Tooltip label={locale.insertImage}>
          <ToolbarButton onClick={() => onOpenMedia("image")}>
            <ImageIcon size={14} />
          </ToolbarButton>
        </Tooltip>
      )}
      {f.video && (
        <Tooltip label={locale.insertVideo}>
          <ToolbarButton onClick={() => onOpenMedia("video")}>
            <Video size={14} />
          </ToolbarButton>
        </Tooltip>
      )}

      {f.table && s.isTable && (
        <>
          <ToolbarSeparator />
          <GL>Table</GL>
          <Tooltip label="Add column after">
            <ToolbarButton
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <Columns2 size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label="Add row after">
            <ToolbarButton
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <Rows2 size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label="Merge cells">
            <ToolbarButton
              onClick={() => editor.chain().focus().mergeCells().run()}
            >
              <TableCellsMerge size={14} />
            </ToolbarButton>
          </Tooltip>
          <Tooltip label="Delete table">
            <ToolbarButton
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="text-[var(--editor-danger)] hover:bg-[var(--editor-danger-bg)]"
            >
              <Trash2 size={14} />
            </ToolbarButton>
          </Tooltip>
        </>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "itzsa-editor-toolbar sticky top-0 z-40 border-b border-[var(--editor-border)]",
        className,
      )}
      role="toolbar"
      aria-label="Formatting"
    >
      <div className="hidden sm:block">
        <Row1 />
        <Row2 />
      </div>

      <div className="sm:hidden">
        <div className="flex items-center justify-between border-b border-[var(--editor-border)] px-2 py-1.5">
          <div className="flex flex-wrap items-center gap-0.5">
            {f.history && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                >
                  <Undo2 size={14} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                >
                  <Redo2 size={14} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            {f.marks && (
              <>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={s.isBold}
                >
                  <Bold size={14} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={s.isItalic}
                >
                  <Italic size={14} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  active={s.isUnderline}
                >
                  <Underline size={14} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            {f.lists && (
              <>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  active={s.isBulletList}
                >
                  <List size={14} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  active={s.isOrderedList}
                >
                  <ListOrdered size={14} />
                </ToolbarButton>
                <ToolbarSeparator />
              </>
            )}
            {f.html && (
              <ToolbarButton onClick={onToggleHtml} active={htmlMode}>
                <span className="font-mono text-[11px] leading-none font-bold">
                  &lt;/&gt;
                </span>
              </ToolbarButton>
            )}
          </div>
          <ToolbarButton
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="More tools"
          >
            {mobileOpen ? <X size={14} /> : <Menu size={14} />}
          </ToolbarButton>
        </div>

        {mobileOpen && (
          <div className="overflow-x-auto border-b border-[var(--editor-border)] bg-[var(--editor-bg)]">
            <Row1 />
            <Row2 />
          </div>
        )}
      </div>
    </div>
  );
};
