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
        header: "var(--accent)",
        headerForeground: "var(--accent-fg)",
        icon: "var(--accent)",
        focusRing: "var(--accent-fg)",
        launcher: "var(--accent)",
        launcherForeground: "#ffffff",
        launcherRing: "#ffffff",
      }}
    />
  );
}
