import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

/** Canonical production origin for docs + Open Graph. */
export const SITE_URL = "https://itzsa.acharya-suman.com.np";

export const SITE_NAME = "itzsa";

export const SITE_DESCRIPTION =
  "Open-source React + TypeScript npm packages for Nepal-ready UIs: React DataTable (@itzsa/table), Nepali input & Bikram Sambat datepicker, BS date math, NRB forex, eSewa/Khalti/ConnectIPS, captcha, accessibility toolbar, Nepal geography selects, TipTap editor, and page builder. Install @itzsa/* from npm.";

export const SITE_AUTHOR = {
  name: "Suman Acharya",
  url: "https://sumanacharya186.com.np/",
  github: "https://github.com/SumanPoU",
  twitter: "@sumanpou",
  email: "sumanacharya186@gmail.com",
} as const;

export type PackageSeoEntry = {
  path: string;
  packageName: string;
  /** Short card title on the homepage */
  shortName: string;
  /** Visible / meta title — primary keyword first */
  title: string;
  description: string;
  blurb: string;
  /** Search keywords for web + aligned with npm package.json */
  keywords: string[];
  /** Alternate names for JSON-LD */
  alternateName?: string[];
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
    title:
      "React DataTable Component — Sorting, Pagination, Export | @itzsa/table",
    description:
      "Best React DataTable for Next.js & TypeScript: sortable columns, pagination, filters, row selection, inline editing, CSV/Excel export, tree data, and keyboard navigation. Install: pnpm add @itzsa/table. Docs & demos.",
    blurb: "Data tables with selection, export, and actions.",
    alternateName: [
      "itzsa table",
      "itzsa datatable",
      "React DataTable",
      "shadcn DataTable",
    ],
    keywords: [
      "react datatable",
      "react data table",
      "react table component",
      "next.js datatable",
      "typescript datatable",
      "sortable table react",
      "paginated table react",
      "tanstack table",
      "shadcn table",
      "shadcn datatable",
      "csv export react",
      "excel export react",
      "tree data table",
      "row selection table",
      "editable data grid",
      "mui datagrid alternative",
      "npm react table",
      "@itzsa/table",
    ],
    priority: 0.98,
  },
  {
    path: "/page-builder",
    packageName: "@itzsa/page-builder",
    shortName: "Page Builder",
    title:
      "React Page Builder — Drag & Drop Visual Editor | @itzsa/page-builder",
    description:
      "Elementor-style React page builder: drag-and-drop blocks, locales, motion effects, author CSS/JS, canvas/preview/open parity. Install: pnpm add @itzsa/page-builder.",
    blurb: "Visual pages — canvas, preview, locales.",
    alternateName: [
      "itzsa page builder",
      "react visual editor",
      "react drag and drop page builder",
    ],
    keywords: [
      "react page builder",
      "drag and drop page builder",
      "visual page editor react",
      "elementor for react",
      "webflow alternative react",
      "puck editor alternative",
      "block based editor",
      "i18n page builder",
      "next.js page builder",
      "@itzsa/page-builder",
    ],
    priority: 0.97,
  },
  {
    path: "/nepal-pay",
    packageName: "@itzsa/nepal-pay",
    shortName: "Nepal Pay",
    title:
      "eSewa, Khalti & ConnectIPS Payment SDK (TypeScript) | @itzsa/nepal-pay",
    description:
      "Nepal payment gateway SDK: eSewa ePay v2, Khalti KPG-2, ConnectIPS with mandatory server-side verify. TypeScript-first. Install: pnpm add @itzsa/nepal-pay.",
    blurb: "eSewa + Khalti + ConnectIPS with verify.",
    alternateName: ["itzsa nepal pay", "esewa khalti sdk"],
    keywords: [
      "esewa",
      "esewa epay",
      "khalti",
      "khalti kpg",
      "connectips",
      "nepal payment gateway",
      "nepal payment sdk",
      "npr payment",
      "esewa typescript",
      "khalti typescript",
      "@itzsa/nepal-pay",
    ],
    priority: 0.97,
  },
  {
    path: "/nepali-datepicker",
    packageName: "@itzsa/nepali-datepicker",
    shortName: "Datepicker",
    title:
      "Nepali Bikram Sambat Datepicker for React | @itzsa/nepali-datepicker",
    description:
      "React Nepali (Bikram Sambat) date, datetime, and range pickers with AD↔BS conversion. Production-ready for Nepal apps. Install: pnpm add @itzsa/nepali-datepicker.",
    blurb: "Bikram Sambat date, datetime, and range.",
    alternateName: [
      "nepali date picker",
      "BS datepicker",
      "bikram sambat picker",
    ],
    keywords: [
      "nepali datepicker",
      "nepali date picker",
      "bikram sambat datepicker",
      "bs calendar react",
      "nepali calendar component",
      "ad to bs datepicker",
      "datetime picker nepal",
      "date range nepali",
      "@itzsa/nepali-datepicker",
    ],
    priority: 0.96,
  },
  {
    path: "/nepali-input",
    packageName: "@itzsa/nepali-input",
    shortName: "Nepali Input",
    title: "Nepali Unicode & Preeti Input for React | @itzsa/nepali-input",
    description:
      "React Input/Textarea that transliterates Latin keystrokes to Nepali Devanagari (Unicode or Preeti). Install: pnpm add @itzsa/nepali-input.",
    blurb: "Unicode & Preeti transliteration fields.",
    alternateName: ["preeti input", "nepali transliteration"],
    keywords: [
      "nepali input",
      "preeti",
      "preeti to unicode",
      "unicode nepali",
      "devanagari input",
      "roman to nepali",
      "nepali transliteration",
      "nepali textarea",
      "@itzsa/nepali-input",
    ],
    priority: 0.95,
  },
  {
    path: "/a11y-toolbar",
    packageName: "@itzsa/a11y-toolbar",
    shortName: "A11y Toolbar",
    title: "Accessibility Toolbar for React (WCAG) | @itzsa/a11y-toolbar",
    description:
      "React accessibility preference toolbar: text size, contrast, reduced motion, read aloud. WCAG-grounded, FOUC-safe. Install: pnpm add @itzsa/a11y-toolbar.",
    blurb: "Reading aids — size, contrast, read aloud.",
    alternateName: ["accessibility widget", "a11y toolbar react"],
    keywords: [
      "accessibility toolbar",
      "a11y toolbar",
      "wcag toolbar",
      "read aloud website",
      "text to speech widget",
      "contrast mode",
      "dyslexia friendly website",
      "accessibility widget react",
      "@itzsa/a11y-toolbar",
    ],
    priority: 0.94,
  },
  {
    path: "/captcha",
    packageName: "@itzsa/captcha",
    shortName: "Captcha",
    title: "React Captcha — Math, Slider & Canvas | @itzsa/captcha",
    description:
      "React captcha components: canvas text, BODMAS math, and slider puzzles with client or server trust models. Install: pnpm add @itzsa/captcha.",
    blurb: "Canvas, math & slider captcha.",
    alternateName: ["math captcha react", "slider captcha"],
    keywords: [
      "react captcha",
      "math captcha",
      "slider captcha",
      "canvas captcha",
      "bodmas captcha",
      "bot prevention react",
      "human verification",
      "@itzsa/captcha",
    ],
    priority: 0.93,
  },
  {
    path: "/bs-date",
    packageName: "@itzsa/bs-date",
    shortName: "BS Date",
    title: "Bikram Sambat Date Library (AD↔BS) | @itzsa/bs-date",
    description:
      "Headless Bikram Sambat convert, arithmetic, format, and Nepal holidays. Pluggable engines for React or Node. Install: pnpm add @itzsa/bs-date.",
    blurb: "Headless BS convert, arithmetic, holidays.",
    alternateName: ["bs date converter", "ad to bs javascript"],
    keywords: [
      "bikram sambat",
      "bs date",
      "ad to bs",
      "bs to ad",
      "nepali date conversion",
      "nepal holidays api",
      "headless calendar",
      "@itzsa/bs-date",
    ],
    priority: 0.93,
  },
  {
    path: "/nrb-forex",
    packageName: "@itzsa/nrb-forex",
    shortName: "NRB Forex",
    title: "Nepal Rastra Bank Forex Rates API Client | @itzsa/nrb-forex",
    description:
      "Typed NRB forex client — fetch official exchange rates, cache, and convert foreign currency to NPR. Install: pnpm add @itzsa/nrb-forex.",
    blurb: "Official NRB rates — fetch, cache, convert.",
    alternateName: ["nrb exchange rate", "nepal forex api"],
    keywords: [
      "nrb forex",
      "nepal rastra bank",
      "nrb exchange rate",
      "forex nepal",
      "npr converter",
      "currency converter nepal",
      "fx api nepal",
      "@itzsa/nrb-forex",
    ],
    priority: 0.92,
  },
  {
    path: "/nepal-geo",
    packageName: "@itzsa/nepal-geo",
    shortName: "Nepal Geo",
    title:
      "Nepal Province District Municipality Ward Selects | @itzsa/nepal-geo",
    description:
      "Nepal geography cascade selects: province → district → local level → ward, plus @itzsa/nepal-geo-data. Install: pnpm add @itzsa/nepal-geo.",
    blurb: "Province → district → local → ward.",
    alternateName: ["nepal address select", "nepal municipality dropdown"],
    keywords: [
      "nepal geography",
      "nepal province district",
      "municipality select",
      "ward select nepal",
      "local level nepal",
      "nepal address form",
      "cascade select nepal",
      "@itzsa/nepal-geo",
      "@itzsa/nepal-geo-data",
    ],
    priority: 0.92,
  },
  {
    path: "/editor",
    packageName: "@itzsa/editor",
    shortName: "Editor",
    title: "TipTap Rich Text Editor with Nepali Support | @itzsa/editor",
    description:
      "TipTap WYSIWYG for React with Nepali Unicode/Preeti, media uploads, HTML sanitization, and toolbar. Install: pnpm add @itzsa/editor.",
    blurb: "Rich text with optional Nepali tooling.",
    alternateName: ["itzsa editor", "nepali tiptap"],
    keywords: [
      "tiptap",
      "tiptap react",
      "rich text editor",
      "wysiwyg react",
      "nepali editor",
      "prosemirror",
      "html sanitization editor",
      "@itzsa/editor",
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
    title: "itzsa shadcn registry — install components via CLI",
    description:
      "Install itzsa components via the shadcn CLI registry, or use npm packages (@itzsa/*) for semver releases.",
  },
] as const;

/** Aggregated homepage / root keywords (deduped in buildMetadata). */
export const SITE_KEYWORDS = [
  "itzsa",
  "itzsa npm",
  "@itzsa",
  "react component library",
  "react typescript packages",
  "nepal react components",
  "nepal developer tools",
  "open source nepal",
  "npm packages nepal",
  "react datatable",
  "nepali datepicker",
  "bikram sambat",
  "esewa khalti",
  "nrb forex",
  "react page builder",
  "accessibility toolbar",
  "math captcha",
  ...PACKAGE_CATALOG.flatMap((p) => [
    p.packageName,
    p.shortName.toLowerCase(),
    ...(p.alternateName ?? []),
  ]),
] as const;

export function npmPackageUrl(packageName: string): string {
  return `https://www.npmjs.com/package/${packageName}`;
}

export function githubPackageUrl(packageName: string): string {
  const dir = packageName.replace("@itzsa/", "");
  return `https://github.com/SumanPoU/package/tree/main/packages/${dir}`;
}

export function githubRepoUrl(): string {
  return "https://github.com/SumanPoU/package";
}

/** Read published package version from monorepo package.json (build-time). */
export function getLocalPackageVersion(packageName: string): string {
  try {
    const dir = packageName.replace("@itzsa/", "");
    const raw = readFileSync(
      join(process.cwd(), "packages", dir, "package.json"),
      "utf8",
    );
    const version = (JSON.parse(raw) as { version?: string }).version;
    return version?.trim() || "latest";
  } catch {
    return "latest";
  }
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
  const ogTitle = title.includes(SITE_NAME) ? title : `${title}`;

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
          `pnpm add ${packageName}`,
        ]
      : []),
    ...keywords,
  ];

  return {
    // Absolute titles for home + packages (avoids layout template doubling).
    title: packageName || path === "/" ? { absolute: title } : title,
    description,
    keywords: [...new Set(baseKeywords)],
    authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.url }],
    creator: SITE_AUTHOR.name,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    category: "technology",
    classification: "Software Development",
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: packageName ? "article" : "website",
      locale: "en_US",
      alternateLocale: ["ne_NP"],
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: ogTitle,
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
    other: packageName
      ? {
          "package:name": packageName,
          "package:ecosystem": "npm",
        }
      : undefined,
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
    keywords: [
      ...entry.keywords,
      ...(entry.alternateName ?? []),
      ...extraKeywords,
    ],
  });
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

export function getPackageByPath(path: string): PackageSeoEntry | undefined {
  return PACKAGE_CATALOG.find((p) => p.path === path);
}
