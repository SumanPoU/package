import type { Metadata } from "next";

/** Canonical production origin for docs + Open Graph. */
export const SITE_URL = "https://itzsa.acharya-suman.com.np";

export const SITE_NAME = "itzsa";

export const SITE_DESCRIPTION =
  "Open-source React component library for Nepal-ready product UIs — DataTable, Nepali input, Bikram Sambat datepicker and headless BS date logic, geography selects, and TipTap editor.";

export const SITE_AUTHOR = {
  name: "Suman Acharya",
  url: "https://sumanacharya186.com.np/",
  github: "https://github.com/sumanpou",
  twitter: "@sumanpou",
} as const;

export const PACKAGE_ROUTES = [
  {
    path: "/",
    title: "itzsa — React component library",
    description: SITE_DESCRIPTION,
  },
  {
    path: "/table",
    title: "@itzsa/table — DataTable documentation",
    description:
      "Composable React DataTable with sorting, pagination, filters, selection, editing, export, and tree data. Install with pnpm add @itzsa/table.",
    packageName: "@itzsa/table",
  },
  {
    path: "/nepali-input",
    title: "@itzsa/nepali-input — Nepali Input documentation",
    description:
      "React Input and Textarea that transliterate Latin keystrokes to Nepali Devanagari (Unicode or Preeti). Install with pnpm add @itzsa/nepali-input.",
    packageName: "@itzsa/nepali-input",
  },
  {
    path: "/nepali-datepicker",
    title: "@itzsa/nepali-datepicker — Bikram Sambat datepicker",
    description:
      "Nepali (Bikram Sambat) date, datetime, and range pickers for React with validation and styling API. Install with pnpm add @itzsa/nepali-datepicker.",
    packageName: "@itzsa/nepali-datepicker",
  },
  {
    path: "/bs-date",
    title: "@itzsa/bs-date — Headless Bikram Sambat dates",
    description:
      "Headless Bikram Sambat convert, arithmetic, format, and holidays with pluggable calendar engines. Install with pnpm add @itzsa/bs-date.",
    packageName: "@itzsa/bs-date",
  },
  {
    path: "/nepal-geo",
    title: "@itzsa/nepal-geo — Nepal geography selects",
    description:
      "Nepal provinces, districts, local levels, and wards — searchable cascade selects plus @itzsa/nepal-geo-data. Install with pnpm add @itzsa/nepal-geo.",
    packageName: "@itzsa/nepal-geo",
  },
  {
    path: "/editor",
    title: "@itzsa/editor — TipTap rich text editor",
    description:
      "TipTap rich text editor with Nepali Unicode/Preeti, media uploads, sanitization, and toolbar. Install with pnpm add @itzsa/editor.",
    packageName: "@itzsa/editor",
  },
  {
    path: "/registry",
    title: "itzsa shadcn registry",
    description:
      "Install itzsa components via the shadcn CLI registry, or use npm packages for semver.",
  },
] as const;

type BuildMetaOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  packageName?: string;
};

/** Shared advanced Metadata for App Router pages. */
export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  packageName,
}: BuildMetaOptions): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const ogTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;

  const baseKeywords = [
    "itzsa",
    "react",
    "components",
    "nepal",
    "typescript",
    "npm",
    ...(packageName ? [packageName, packageName.replace("@itzsa/", "")] : []),
    ...keywords,
  ];

  return {
    title,
    description,
    keywords: [...new Set(baseKeywords)],
    authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.url }],
    creator: SITE_AUTHOR.name,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    category: "technology",
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: packageName ? "article" : "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — React component library`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      creator: SITE_AUTHOR.twitter,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
