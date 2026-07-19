import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { RegistryPage } from "./registry-page";

export const metadata: Metadata = buildMetadata({
  title: "shadcn Registry",
  description:
    "Install itzsa components via the shadcn CLI registry, or use npm packages (@itzsa/table, @itzsa/editor) for semver.",
  path: "/registry",
  keywords: ["shadcn", "registry", "cli", "copy paste components"],
});

export default function Page() {
  return <RegistryPage />;
}
