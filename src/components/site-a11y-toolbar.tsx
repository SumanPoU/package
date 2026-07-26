"use client";

import { A11yToolbar } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";

/**
 * Site-wide mount — keep outside `[data-a11y-content]`.
 * `position` = launcher · `panelAlign` = panel edge (left / right / center / auto).
 */
export function SiteA11yToolbar() {
  return (
    <A11yToolbar
      position="bottom-center"
      panelAlign="left"
      offset="1.25rem"
      launcherSize="3.75rem"
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
