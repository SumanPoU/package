"use client";

import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";
import { usePathname } from "next/navigation";

/**
 * Site-wide mount — keep outside `[data-a11y-content]`.
 * Hidden on the fullscreen page-builder create route.
 */
export function SiteA11yToolbar() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/page-builder/create") ||
    pathname.startsWith("/page-builder/canvas")
  )
    return null;

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
