"use client";

import { A11yToolbar } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";

/** Site-wide mount — keep outside `[data-a11y-content]`. */
export function SiteA11yToolbar() {
  return <A11yToolbar />;
}
