import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { RegistryPage } from "./registry-page";

export const metadata: Metadata = buildMetadata({
  title: "itzsa shadcn Registry — install @itzsa components via CLI",
  description:
    "Install itzsa React components (DataTable, editor, Nepali UI) via the shadcn CLI registry, or use versioned npm packages (@itzsa/table, @itzsa/editor, and more).",
  path: "/registry",
  keywords: [
    "shadcn registry",
    "shadcn cli",
    "itzsa registry",
    "copy paste components",
    "react datatable shadcn",
    "@itzsa/table",
  ],
});

export default function Page() {
  return <RegistryPage />;
}
