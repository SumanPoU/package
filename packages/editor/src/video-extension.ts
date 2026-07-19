import { Node, mergeAttributes } from "@tiptap/core";

import { sanitizeCssLength, sanitizeUrl } from "./security";

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
  allowBase64: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: {
        src: string;
        width?: string | null;
        poster?: string | null;
      }) => ReturnType;
    };
  }
}

/**
 * Schema-safe video node. Never insert via HTML string templates.
 */
export const Video = Node.create<VideoOptions>({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "itzsa-editor-video",
      },
      allowBase64: false,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const raw = el.getAttribute("src");
          return raw
            ? sanitizeUrl(raw, { allowDataImage: false, allowRelative: true })
            : null;
        },
        renderHTML: (attrs) => {
          if (!attrs.src) return {};
          const safe = sanitizeUrl(String(attrs.src), {
            allowDataImage: false,
            allowRelative: true,
          });
          return safe ? { src: safe } : {};
        },
      },
      width: {
        default: null,
        parseHTML: (el: HTMLElement) =>
          sanitizeCssLength(el.getAttribute("width") || el.style.width || null),
        renderHTML: (attrs) => {
          const w = sanitizeCssLength(attrs.width);
          if (!w) return {};
          return { width: w, style: `width: ${w}` };
        },
      },
      poster: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const raw = el.getAttribute("poster");
          return raw
            ? sanitizeUrl(raw, { allowDataImage: false, allowRelative: true })
            : null;
        },
        renderHTML: (attrs) => {
          if (!attrs.poster) return {};
          const safe = sanitizeUrl(String(attrs.poster), {
            allowDataImage: false,
            allowRelative: true,
          });
          return safe ? { poster: safe } : {};
        },
      },
      controls: {
        default: true,
        parseHTML: () => true,
        renderHTML: () => ({ controls: "controls" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        controls: "controls",
      }),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          const src = sanitizeUrl(options.src, {
            allowDataImage: false,
            allowRelative: true,
          });
          if (!src) return false;
          return commands.insertContent({
            type: this.name,
            attrs: {
              src,
              width: sanitizeCssLength(options.width ?? null),
              poster: options.poster
                ? sanitizeUrl(options.poster, {
                    allowDataImage: false,
                    allowRelative: true,
                  })
                : null,
              controls: true,
            },
          });
        },
    };
  },
});
