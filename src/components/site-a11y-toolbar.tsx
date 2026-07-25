"use client";

import { A11yToolbar } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";

/**
 * Site-wide mount — keep outside `[data-a11y-content]`.
 * Position / size / colors are prop-driven for host branding.
 */
export function SiteA11yToolbar() {
  return (
    <A11yToolbar
      position="bottom-right"
      offset="1.25rem"
      launcherSize="3.5rem"
      theme={{
        accent: "var(--accent)",
        header: "var(--accent)",
        headerForeground: "var(--accent-fg)",
        icon: "var(--accent)",
        focusRing: "var(--accent-fg)",
        launcher: "var(--accent)",
        launcherForeground: "#ffffff",
        launcherRing: "#ffffff",
        fontFamily:
          'var(--font-outfit), "Outfit", system-ui, -apple-system, sans-serif',
      }}
    />
  );
}
