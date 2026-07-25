"use client";

import { A11yToolbar } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";

/**
 * Site-wide mount — keep outside `[data-a11y-content]`.
 * Theme tokens follow docs `--accent` / Outfit so light+dark stay aligned.
 */
export function SiteA11yToolbar() {
  return (
    <A11yToolbar
      position="bottom-right"
      theme={{
        accent: "var(--accent)",
        header: "var(--accent)",
        headerForeground: "var(--accent-fg)",
        icon: "var(--accent)",
        focusRing: "var(--accent-fg)",
        fontFamily:
          'var(--font-outfit), "Outfit", system-ui, -apple-system, sans-serif',
      }}
    />
  );
}
