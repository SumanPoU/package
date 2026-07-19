import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Noto_Sans_Devanagari } from "next/font/google";

import { DocsContent } from "./docs-content";

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

export const metadata: Metadata = {
  title: "@itzsa/editor — Documentation",
  description:
    "TipTap rich text editor with Nepali Unicode/Preeti input — install, demo, and props.",
};

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
