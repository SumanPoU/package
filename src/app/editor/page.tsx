import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import type { CSSProperties } from "react";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/editor — Rich Text Editor",
  description:
    "TipTap rich text editor with Nepali Unicode/Preeti, media uploads, sanitization, toolbar, and full props tables.",
  path: "/editor",
  packageName: "@itzsa/editor",
  keywords: ["tiptap", "rich text", "wysiwyg", "nepali editor", "html editor"],
});

export default function EditorDocsPage() {
  return (
    <div
      className={notoDevanagari.variable}
      style={
        {
          "--itzsa-nepali-font":
            "var(--font-noto-devanagari), 'Noto Sans Devanagari', sans-serif",
        } as CSSProperties
      }
    >
      <DocsContent />
    </div>
  );
}
