import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — React & TypeScript packages`,
    short_name: SITE_NAME,
    description:
      "Open-source React + TypeScript npm packages (@itzsa/*) for Nepal-ready UIs — DataTable, Nepali tools, payments, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0b",
    theme_color: "#1d9e75",
    lang: "en",
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: "/opengraph-image",
        sizes: "1200x630",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
