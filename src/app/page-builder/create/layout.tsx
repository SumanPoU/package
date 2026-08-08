import type { ReactNode } from "react";

/** Fullscreen builder chrome — site nav/footer/a11y are hidden via pathname checks. */
export default function PageBuilderCreateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#f4f4f5] text-gray-900 light">
      {children}
    </div>
  );
}
