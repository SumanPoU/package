import type { Metadata } from "next";

import { CreateBuilder } from "./create-builder";

export const metadata: Metadata = {
  title: "Create page · Page Builder",
  description: "Drag-and-drop visual page builder",
  robots: { index: false, follow: false },
};

export default function PageBuilderCreatePage() {
  return <CreateBuilder />;
}
