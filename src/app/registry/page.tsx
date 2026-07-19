import type { Metadata } from "next";

import { RegistryPage } from "./registry-page";

export const metadata: Metadata = {
  title: "Registry — itzsa",
  description:
    "Install itzsa components via the shadcn CLI, or use npm packages for semver.",
};

export default function Page() {
  return <RegistryPage />;
}
