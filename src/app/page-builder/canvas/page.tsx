import type { Metadata } from "next";

import { CanvasShellClient } from "./canvas-shell-client";

export const metadata: Metadata = {
  title: "Page builder canvas",
  robots: { index: false, follow: false },
};

/** Iframe document body for sandboxed canvas (parent chrome hidden via layout). */
export default function PageBuilderCanvasPage() {
  return <CanvasShellClient />;
}
