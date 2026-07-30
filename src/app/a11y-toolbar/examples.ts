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

export const REACT_NEXT = `// app/layout.tsx — Server Component
import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";
import { A11yToolbarClient } from "./a11y-toolbar-client";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const a11yFouc = getA11yFoucScript();
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: a11yFouc }} />
      </head>
      <body>
        <main data-a11y-content>{children}</main>
        <A11yToolbarClient />
      </body>
    </html>
  );
}

// a11y-toolbar-client.tsx
"use client";
import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";

export function A11yToolbarClient() {
  return (
    <A11yToolbar
      position="bottom-center"
      panelAlign="left"
      locales={{ ne: NE_MESSAGES }}
    />
  );
}`;

export const REACT_VITE = `// main.tsx — Vite + React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";
import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";
import "@itzsa/a11y-toolbar/styles.css";
import App from "./App";

// FOUC bootstrap before first paint
const boot = document.createElement("script");
boot.textContent = getA11yFoucScript();
document.head.appendChild(boot);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div data-a11y-content>
      <App />
    </div>
    <A11yToolbar
      position="bottom-right"
      locales={{ ne: NE_MESSAGES }}
    />
  </StrictMode>,
);`;

export const SHORTCUTS_EXAMPLE = `import {
  A11yToolbar,
  DEFAULT_A11Y_SHORTCUTS,
  mergeA11yShortcuts,
} from "@itzsa/a11y-toolbar";

// Defaults: Alt+A panel, Alt+Shift+R reset, Alt+Shift± text size, …
<A11yToolbar />

// Remap panel toggle only (feature shortcuts stay)
<A11yToolbar hotkey={{ altKey: true, shiftKey: true, key: "a" }} />

// Panel hotkey only — no feature shortcuts
<A11yToolbar shortcuts={false} />

// Scalable custom map
<A11yToolbar
  shortcuts={mergeA11yShortcuts(DEFAULT_A11Y_SHORTCUTS, [
    { id: "reset", keys: null }, // remove
    {
      id: "textSizeInc",
      keys: { altKey: true, key: "]" },
      action: { type: "feature", feature: "textSize", mode: "inc" },
      label: "Increase text size",
    },
  ])}
/>`;

export const FEATURES_FLAG = `<A11yToolbar
  features={{
    colorFilter: false,
    biggerCursor: false,
    readingGuide: false,
  }}
/>`;

export const THEME_EXAMPLE = `import { A11yToolbar, CSS_VAR } from "@itzsa/a11y-toolbar";

// 1) theme prop — each token maps to --itzsa-a11y-*
<A11yToolbar
  theme={{
    accent: "var(--accent)",
    header: "#15805f",
    headerForeground: "#ffffff",
    background: "#e8eaef",
    card: "#f7f6f4",
    foreground: "#1a1a1a",
    muted: "#4b4b4b",
    radius: "8px",
    launcherRadius: "999px",
    // Bigger cursor asset (applied on <html> when preference is on)
    cursor: 'url("/cursors/big.svg") 2 2',
    guideHeight: "56px",
  }}
/>

// 2) style prop — same CSS variables, any token
<A11yToolbar
  style={{
    [CSS_VAR.toolbarAccent]: "#0f766e",
    [CSS_VAR.toolbarRadius]: "12px",
    [CSS_VAR.launcherSize]: "3.25rem",
  }}
/>

// 3) Host stylesheet — override on :root / html
/*
:root {
  --itzsa-a11y-toolbar-accent: #0f766e;
  --itzsa-a11y-cursor: url("/cursors/big.svg") 2 2;
}
*/`;

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
    // Optional: remap shortcuts
    // shortcuts: ItzsaA11yToolbar.mergeA11yShortcuts(
    //   ItzsaA11yToolbar.DEFAULT_A11Y_SHORTCUTS,
    //   [{ id: "reset", keys: null }],
    // ),
  });
</script>`;

export const WP_PHP = `add_action('wp_enqueue_scripts', function () {
  $css = '${CDN_CSS}';
  $js  = '${CDN_JS}';
  wp_enqueue_style('itzsa-a11y', $css, [], null);
  wp_enqueue_script('itzsa-a11y', $js, [], null, true);
  wp_add_inline_script('itzsa-a11y', 'ItzsaA11yToolbar.mount({ contentRoot: "main" });', 'after');
});`;
