"use client";

import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";

/**
 * Site-wide mount — keep outside `[data-a11y-content]`.
 * Fonts: English → Outfit, Nepali → Poppins (via package defaults + CSS vars).
 */
export function SiteA11yToolbar() {
  return (
    <A11yToolbar
      position="bottom-center"
      panelAlign="left"
      offset="1.25rem"
      launcherSize="3.75rem"
      defaultLocale="en"
      locales={{ ne: NE_MESSAGES }}
      theme={{
        accent: "var(--accent)",
        // Header pair must clear 4.5:1 — do not reuse --accent / --accent-fg here
        // (--accent #1d9e75 with --accent-fg #04342c ≈ 4.05:1).
        header: "#15805f",
        headerForeground: "#ffffff",
        icon: "var(--accent)",
        focusRing: "var(--accent-fg)",
        launcher: "var(--accent)",
        launcherForeground: "#ffffff",
        launcherRing: "#ffffff",
      }}
    />
  );
}
