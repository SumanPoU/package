/** Doc code samples — keep out of `"use client"` modules (avoids React script warnings). */

import { SITE_URL } from "@/lib/seo";

export const CDN_CSS = `${SITE_URL}/cdn/a11y-toolbar/a11y-toolbar.min.css`;
export const CDN_JS = `${SITE_URL}/cdn/a11y-toolbar/a11y-toolbar.min.js`;

/** After npm publish — jsDelivr mirrors the package dist. */
export const JSDELIVR_CSS =
  "https://cdn.jsdelivr.net/npm/@itzsa/a11y-toolbar@latest/dist/a11y-toolbar.min.css";
export const JSDELIVR_JS =
  "https://cdn.jsdelivr.net/npm/@itzsa/a11y-toolbar@latest/dist/a11y-toolbar.min.js";

export const STARTER = `import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";
import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";
import "@itzsa/a11y-toolbar/styles.css";

// 1. FOUC bootstrap in root layout <head> (Server Component — /headless)
const a11yFouc = getA11yFoucScript();
// render: script with dangerouslySetInnerHTML={{ __html: a11yFouc }}

// 2. SSR content root — required for FOUC + scoped effects
<main data-a11y-content>{children}</main>

// 3. Mount once from a Client Component, outside the content root
<A11yToolbar
  position="bottom-center"
  panelAlign="left"
  defaultLocale="en"
  locales={{ ne: NE_MESSAGES }}
  panelMaxHeight="70dvh"
  theme={{
    accent: "var(--accent)",
    header: "#15805f",
    headerForeground: "#ffffff",
    launcher: "var(--accent)",
    launcherForeground: "#ffffff",
    launcherRing: "#ffffff",
  }}
/>`;

export const FEATURES_FLAG = `<A11yToolbar
  features={{
    colorFilter: false,
    biggerCursor: false,
    readingGuide: false,
  }}
/>`;

export const I18N_SYNC = `// Controlled locale — same source of truth as Zustand / Redux / next-intl
const locale = useAppLocale();
const setLocale = useSetAppLocale();

<A11yToolbar
  locale={locale}
  onLocaleChange={setLocale}
  locales={{ ne: NE_MESSAGES }}
  messages={{ panelTitle: "Site accessibility" }}
/>`;

export const WP_HTML = `<!-- itzsa CDN (hosted on docs site) -->
<link rel="stylesheet" href="${CDN_CSS}" />
<script src="${CDN_JS}"></script>
<script>
  ItzsaA11yToolbar.mount({
    position: "bottom-center",
    panelAlign: "left",
    contentRoot: "main", // or true for <body>
    locales: { ne: ItzsaA11yToolbar.NE_MESSAGES },
  });
</script>`;

export const WP_PHP = `add_action('wp_enqueue_scripts', function () {
  $css = '${CDN_CSS}';
  $js  = '${CDN_JS}';
  wp_enqueue_style('itzsa-a11y', $css, [], null);
  wp_enqueue_script('itzsa-a11y', $js, [], null, true);
  wp_add_inline_script('itzsa-a11y', 'ItzsaA11yToolbar.mount({ contentRoot: "main" });', 'after');
});`;
