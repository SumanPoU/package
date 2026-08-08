import type { Metadata } from "next";

/** Canonical production origin for docs + Open Graph. */
export const SITE_URL = "https://itzsa.acharya-suman.com.np";

export const SITE_NAME = "itzsa";

export const SITE_DESCRIPTION =
  "Open-source React + TypeScript packages for Nepal-ready UIs — DataTable, Nepali input, Bikram Sambat datepicker, BS date math, NRB forex, eSewa/Khalti/ConnectIPS payments, captcha, accessibility toolbar, geography selects, and TipTap editor. Install from npm: @itzsa/*.";

export const SITE_AUTHOR = {
  name: "Suman Acharya",
  url: "https://sumanacharya186.com.np/",
  github: "https://github.com/sumanpou",
  twitter: "@sumanpou",
  email: "sumanacharya186@gmail.com",
} as const;

export type PackageSeoEntry = {
  path: string;
  packageName: string;
  /** Short card title on the homepage */
  shortName: string;
  title: string;
  description: string;
  blurb: string;
  /** Search keywords for web + aligned with npm package.json */
  keywords: string[];
  /** Sitemap priority — packages rank just under home */
  priority: number;
};

/**
 * Canonical package catalog — drives homepage, sitemap, JSON-LD, and metadata.
 * Ordered for “packages at the top” discovery (popular / high-intent first).
 */
export const PACKAGE_CATALOG: readonly PackageSeoEntry[] = [
  {
    path: "/table",
    packageName: "@itzsa/table",
    shortName: "Table",
    title: "@itzsa/table — React DataTable",
    description:
      "Composable React DataTable with sorting, pagination, filters, row selection, editing, CSV/Excel export, and tree data. pnpm add @itzsa/table.",
    blurb: "Data tables with selection, export, and actions.",
    keywords: [
      "react datatable",
      "data table",
      "tanstack table",
      "shadcn table",
      "sortable table",
      "pagination",
      "csv export",
      "excel export",
      "tree data",
      "row selection",
    ],
    priority: 0.95,
  },
  {
    path: "/nepali-datepicker",
    packageName: "@itzsa/nepali-datepicker",
    shortName: "Datepicker",
    title: "@itzsa/nepali-datepicker — Bikram Sambat datepicker",
    description:
      "Nepali Bikram Sambat date, datetime, and range pickers for React. AD↔BS aware UI with validation. pnpm add @itzsa/nepali-datepicker.",
    blurb: "Bikram Sambat date, datetime, and range.",
    keywords: [
      "nepali datepicker",
      "bikram sambat",
      "bs calendar",
      "nepali calendar",
      "datetime picker",
      "date range",
      "nepal date",
    ],
    priority: 0.95,
  },
  {
    path: "/nepali-input",
    packageName: "@itzsa/nepali-input",
    shortName: "Nepali Input",
    title: "@itzsa/nepali-input — Nepali Unicode & Preeti",
    description:
      "React Input and Textarea that transliterate Latin keystrokes to Nepali Devanagari (Unicode or Preeti). pnpm add @itzsa/nepali-input.",
    blurb: "Unicode & Preeti transliteration fields.",
    keywords: [
      "nepali input",
      "preeti",
      "unicode nepali",
      "devanagari",
      "transliteration",
      "roman to nepali",
      "nepali textarea",
    ],
    priority: 0.94,
  },
  {
    path: "/bs-date",
    packageName: "@itzsa/bs-date",
    shortName: "BS Date",
    title: "@itzsa/bs-date — Headless Bikram Sambat",
    description:
      "Headless Bikram Sambat convert, arithmetic, format, and holidays with pluggable engines. pnpm add @itzsa/bs-date.",
    blurb: "Headless BS convert, arithmetic, holidays.",
    keywords: [
      "bikram sambat",
      "bs date",
      "ad to bs",
      "bs to ad",
      "nepali date conversion",
      "headless calendar",
      "nepal holidays",
    ],
    priority: 0.93,
  },
  {
    path: "/nepal-pay",
    packageName: "@itzsa/nepal-pay",
    shortName: "Nepal Pay",
    title: "@itzsa/nepal-pay — eSewa, Khalti, ConnectIPS",
    description:
      "TypeScript payment SDK for eSewa ePay v2, Khalti KPG-2, and ConnectIPS with mandatory server-side verify. pnpm add @itzsa/nepal-pay.",
    blurb: "eSewa + Khalti + ConnectIPS with verify.",
    keywords: [
      "esewa",
      "khalti",
      "connectips",
      "nepal payment",
      "epay",
      "kpg-2",
      "npr payment gateway",
      "payment sdk",
    ],
    priority: 0.95,
  },
  {
    path: "/nrb-forex",
    packageName: "@itzsa/nrb-forex",
    shortName: "NRB Forex",
    title: "@itzsa/nrb-forex — Nepal Rastra Bank rates",
    description:
      "Typed NRB forex client — fetch, cache, and convert foreign currency to NPR. pnpm add @itzsa/nrb-forex.",
    blurb: "Official NRB rates — fetch, cache, convert.",
    keywords: [
      "nrb",
      "nepal rastra bank",
      "forex",
      "exchange rate",
      "npr",
      "currency converter nepal",
      "fx api",
    ],
    priority: 0.92,
  },
  {
    path: "/a11y-toolbar",
    packageName: "@itzsa/a11y-toolbar",
    shortName: "A11y Toolbar",
    title: "@itzsa/a11y-toolbar — Accessibility toolbar",
    description:
      "React accessibility preference toolbar — text size, contrast, motion, read aloud, WCAG-grounded chrome, FOUC-safe. pnpm add @itzsa/a11y-toolbar.",
    blurb: "Reading aids — size, contrast, read aloud.",
    keywords: [
      "accessibility toolbar",
      "a11y",
      "wcag",
      "read aloud",
      "text to speech",
      "contrast mode",
      "dyslexia friendly",
      "wordpress accessibility",
      "site preferences",
    ],
    priority: 0.94,
  },
  {
    path: "/captcha",
    packageName: "@itzsa/captcha",
    shortName: "Captcha",
    title: "@itzsa/captcha — Math, slider & canvas captcha",
    description:
      "React captcha — canvas text, BODMAS math, and slider puzzles with client or server trust models. pnpm add @itzsa/captcha.",
    blurb: "Canvas, math & slider captcha.",
    keywords: [
      "react captcha",
      "math captcha",
      "slider captcha",
      "bodmas",
      "bot prevention",
      "human verification",
      "canvas captcha",
    ],
    priority: 0.93,
  },
  {
    path: "/nepal-geo",
    packageName: "@itzsa/nepal-geo",
    shortName: "Nepal Geo",
    title: "@itzsa/nepal-geo — Nepal geography selects",
    description:
      "Nepal provinces, districts, local levels, and wards — searchable cascade selects plus @itzsa/nepal-geo-data. pnpm add @itzsa/nepal-geo.",
    blurb: "Province → district → local → ward.",
    keywords: [
      "nepal geography",
      "province",
      "district",
      "municipality",
      "ward",
      "local level",
      "nepal address",
      "cascade select",
    ],
    priority: 0.92,
  },
  {
    path: "/page-builder",
    packageName: "@itzsa/page-builder",
    shortName: "Page Builder",
    title: "@itzsa/page-builder — Visual page builder",
    description:
      "Drag-and-drop React page builder with locale-aware content, author CSS/JS, canvas/preview/open parity. pnpm add @itzsa/page-builder.",
    blurb: "Visual pages — canvas, preview, locales.",
    keywords: [
      "page builder",
      "drag and drop",
      "visual editor",
      "react page builder",
      "block editor",
      "i18n page builder",
      "webflow alternative",
    ],
    priority: 0.95,
  },
  {
    path: "/editor",
    packageName: "@itzsa/editor",
    shortName: "Editor",
    title: "@itzsa/editor — TipTap rich text",
    description:
      "TipTap rich text editor with Nepali Unicode/Preeti, media uploads, HTML sanitization, and toolbar. pnpm add @itzsa/editor.",
    blurb: "Rich text with optional Nepali tooling.",
    keywords: [
      "tiptap",
      "rich text editor",
      "wysiwyg",
      "nepali editor",
      "html sanitization",
      "react editor",
      "prosemirror",
    ],
    priority: 0.91,
  },
] as const;

export const PACKAGE_ROUTES = [
  {
    path: "/",
    title: "itzsa — React component library for Nepal",
    description: SITE_DESCRIPTION,
  },
  ...PACKAGE_CATALOG.map((p) => ({
    path: p.path,
    title: p.title,
    description: p.description,
    packageName: p.packageName,
  })),
  {
    path: "/registry",
    title: "itzsa shadcn registry",
    description:
      "Install itzsa components via the shadcn CLI registry, or use npm packages for semver.",
  },
] as const;

export function npmPackageUrl(packageName: string): string {
  return `https://www.npmjs.com/package/${packageName}`;
}

export function githubPackageUrl(packageName: string): string {
  const dir = packageName.replace("@itzsa/", "");
  return `https://github.com/SumanPoU/package/tree/main/packages/${dir}`;
}

type BuildMetaOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  packageName?: string;
  /** Set false for payment return / ephemeral pages */
  index?: boolean;
};

/** Shared advanced Metadata for App Router pages. */
export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  packageName,
  index = true,
}: BuildMetaOptions): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const ogTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;

  const baseKeywords = [
    "itzsa",
    "react",
    "react components",
    "typescript",
    "npm",
    "open source",
    "nepal",
    "nepal developer tools",
    ...(packageName
      ? [
          packageName,
          packageName.replace("@itzsa/", ""),
          `npm ${packageName}`,
          `install ${packageName}`,
        ]
      : []),
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
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
        },
  };
}

/** Metadata helper from PACKAGE_CATALOG entry. */
export function buildPackageMetadata(
  entry: PackageSeoEntry,
  extraKeywords: string[] = [],
): Metadata {
  return buildMetadata({
    title: entry.title,
    description: entry.description,
    path: entry.path,
    packageName: entry.packageName,
    keywords: [...entry.keywords, ...extraKeywords],
  });
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

export function getPackageByPath(path: string): PackageSeoEntry | undefined {
  return PACKAGE_CATALOG.find((p) => p.path === path);
}
