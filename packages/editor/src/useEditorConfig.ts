import { useMemo, useRef } from "react";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Extension, type Extensions } from "@tiptap/core";
import type { NepaliInputMode } from "@itzsa/nepali-input";

import { createNepaliInputExtension } from "./NepaliInputExtension";
import { LanguageGuard } from "./LanguageGuard";
import { Video } from "./video-extension";
import {
  sanitizeCssLength,
  sanitizeHtml,
  sanitizeTextTransform,
  sanitizeUrl,
} from "./security";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    textTransform: {
      setTextTransform: (transform: string) => ReturnType;
      unsetTextTransform: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) =>
              sanitizeCssLength(el.style.fontSize || null),
            renderHTML: (attrs: Record<string, unknown>) => {
              const size = sanitizeCssLength(
                typeof attrs.fontSize === "string" ? attrs.fontSize : null,
              );
              if (!size) return {};
              return { style: `font-size: ${size}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          const safe = sanitizeCssLength(fontSize);
          if (!safe) return false;
          return chain().setMark("textStyle", { fontSize: safe }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

const TextTransform = Extension.create({
  name: "textTransform",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textTransform: {
            default: null,
            parseHTML: (el: HTMLElement) =>
              sanitizeTextTransform(el.style.textTransform || null),
            renderHTML: (attrs: Record<string, unknown>) => {
              const t = sanitizeTextTransform(
                typeof attrs.textTransform === "string"
                  ? attrs.textTransform
                  : null,
              );
              if (!t) return {};
              return { style: `text-transform: ${t}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setTextTransform:
        (textTransform: string) =>
        ({ chain }) => {
          const safe = sanitizeTextTransform(textTransform);
          if (!safe) return false;
          return chain().setMark("textStyle", { textTransform: safe }).run();
        },
      unsetTextTransform:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { textTransform: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

function createSafeImage(allowBase64: boolean) {
  return Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        src: {
          default: null,
          parseHTML: (el: HTMLElement) =>
            sanitizeUrl(el.getAttribute("src") ?? "", {
              allowDataImage: allowBase64,
              allowRelative: true,
            }),
          renderHTML: (attrs: Record<string, unknown>) => {
            const safe = sanitizeUrl(String(attrs.src ?? ""), {
              allowDataImage: allowBase64,
              allowRelative: true,
            });
            if (!safe) return {};
            return { src: safe };
          },
        },
        width: {
          default: null,
          parseHTML: (el: HTMLElement) =>
            sanitizeCssLength(
              el.getAttribute("width") || el.style.width || null,
            ),
          renderHTML: (attrs: Record<string, unknown>) => {
            const w = sanitizeCssLength(
              typeof attrs.width === "string" ? attrs.width : null,
            );
            if (!w) return {};
            return { width: w, style: `width: ${w}` };
          },
        },
        height: {
          default: null,
          parseHTML: (el: HTMLElement) =>
            sanitizeCssLength(
              el.getAttribute("height") || el.style.height || null,
            ),
          renderHTML: (attrs: Record<string, unknown>) => {
            const h = sanitizeCssLength(
              typeof attrs.height === "string" ? attrs.height : null,
            );
            if (!h) return {};
            return { height: h, style: `height: ${h}` };
          },
        },
      };
    },
  }).configure({ allowBase64, inline: false });
}

export interface UseEditorConfigOptions {
  content?: string;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
  nepali?: NepaliInputMode | false;
  onLanguageBlock?: (reason: "keystroke" | "paste") => void;
  maxLength?: number;
  allowBase64?: boolean;
  /** Stable TipTap extensions appended after defaults. */
  extensions?: Extensions;
  sanitize?: boolean;
  /**
   * TipTap immediate render. Default `false` under Next.js SSR to avoid
   * hydration mismatches. The editor also client-mounts before creating TipTap.
   */
  immediatelyRender?: boolean;
}

export function useEditorConfig({
  content = "",
  placeholder = "Start writing…",
  editable = true,
  minHeight = "480px",
  nepali = false,
  onLanguageBlock,
  maxLength,
  allowBase64 = false,
  extensions: extraExtensions = [],
  sanitize = true,
  immediatelyRender = false,
}: UseEditorConfigOptions = {}): Editor | null {
  const onBlockRef = useRef(onLanguageBlock);
  onBlockRef.current = onLanguageBlock;

  const extraRef = useRef(extraExtensions);
  extraRef.current = extraExtensions;

  const safeContent = sanitize
    ? sanitizeHtml(content, { allowDataImage: allowBase64, preserveEmpty: true })
    : content;

  const extensions = useMemo(() => {
    // StarterKit v3 already includes Link + Underline.
    // TextStyleKit already includes Color + FontFamily (+ FontSize — we replace).
    const list: Extensions = [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto", "tel"],
          isAllowedUri: (url) =>
            sanitizeUrl(url, {
              allowDataImage: false,
              allowRelative: true,
            }) !== null,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
      }),
      TextStyleKit.configure({
        fontSize: false, // use our sanitized FontSize below
        backgroundColor: false,
        lineHeight: false,
      }),
      FontSize,
      TextTransform,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      createSafeImage(allowBase64),
      Video.configure({ allowBase64: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure(maxLength ? { limit: maxLength } : {}),
      Highlight.configure({ multicolor: false }),
      Subscript,
      Superscript,
      LanguageGuard.configure({
        language: nepali ? "ne" : "en",
        onBlocked: (reason) => onBlockRef.current?.(reason),
      }),
    ];

    if (nepali) {
      list.push(createNepaliInputExtension(nepali));
    }

    list.push(...extraRef.current);
    return list;
  }, [nepali, placeholder, maxLength, allowBase64]);

  const safeMinHeight = sanitizeCssLength(minHeight) ?? "480px";

  return useEditor(
    {
      extensions,
      content: safeContent,
      editable,
      immediatelyRender,
      editorProps: {
        attributes: {
          class: "itzsa-editor-prose outline-none w-full focus:outline-none",
          style: `min-height: ${safeMinHeight}`,
          spellcheck: "true",
        },
        transformPastedHTML(html) {
          return sanitize
            ? sanitizeHtml(html, { allowDataImage: allowBase64 })
            : html;
        },
      },
    },
    [nepali, maxLength, allowBase64, placeholder, immediatelyRender, sanitize],
  );
}
