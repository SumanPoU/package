import type { ReactNode } from "react";

/** Bare shell for CanvasFrame iframe — no site chrome. */
export default function PageBuilderCanvasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900 light">{children}</div>
  );
}
