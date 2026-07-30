import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";
import "@itzsa/a11y-toolbar/styles.css";
import type { Metadata, Viewport } from "next";
import {
  JetBrains_Mono,
  Noto_Sans_Devanagari,
  Outfit,
  Poppins,
} from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { SiteA11yToolbar } from "@/components/site-a11y-toolbar";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — React component library`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "itzsa",
    "itzsa npm",
    "react",
    "react components",
    "typescript",
    "npm",
    "nepal",
    "datatable",
    "nepali input",
    "bikram sambat",
    "datepicker",
    "esewa",
    "khalti",
    "nrb forex",
    "captcha",
    "accessibility toolbar",
    "nepal geo",
    "tiptap",
  ],
  authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.url }],
  creator: SITE_AUTHOR.name,
  publisher: SITE_NAME,
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — React component library`,
    description: SITE_DESCRIPTION,
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
    title: `${SITE_NAME} — React component library`,
    description: SITE_DESCRIPTION,
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
  other: {
    "theme-color": "#1d9e75",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

/** Runs before paint to avoid theme flash. */
const themeInitScript = `(function(){try{var k='itzsa-theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}})();`;

/** Runs before paint so a11y attrs exist before first paint (content wrapper is SSR). */
const a11yInitScript = getA11yFoucScript();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${poppins.variable} ${notoDevanagari.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: theme bootstrap before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a11y prefs bootstrap before paint */}
        <script dangerouslySetInnerHTML={{ __html: a11yInitScript }} />
        <JsonLd />
      </head>
      <body className="flex min-h-full flex-col bg-page font-sans text-primary">
        <ThemeProvider>
          <div data-a11y-content className="flex min-h-0 flex-1 flex-col">
            <SiteNav />
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            <SiteFooter />
          </div>
          <SiteA11yToolbar />
        </ThemeProvider>
      </body>
    </html>
  );
}
