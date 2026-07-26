"use client";

import { useEffect } from "react";

/**
 * When the active docs section changes, keep that nav link visible inside
 * the sticky left/right sidebar scroller (does not move the page).
 */
export function useScrollNavToActive(
  activeId: string,
  sidebarSelector: string,
): void {
  useEffect(() => {
    if (!activeId) return;

    // Defer so layout has painted after section highlight updates.
    const frame = requestAnimationFrame(() => {
      const sidebar = document.querySelector(sidebarSelector);
      if (!(sidebar instanceof HTMLElement)) return;

      const link = sidebar.querySelector(`[data-nav-id="${activeId}"]`);
      if (!(link instanceof HTMLElement)) return;

      const sidebarRect = sidebar.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const pad = 16;

      if (linkRect.top < sidebarRect.top + pad) {
        sidebar.scrollBy({
          top: linkRect.top - sidebarRect.top - pad,
          behavior: "smooth",
        });
        return;
      }
      if (linkRect.bottom > sidebarRect.bottom - pad) {
        sidebar.scrollBy({
          top: linkRect.bottom - sidebarRect.bottom + pad,
          behavior: "smooth",
        });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [activeId, sidebarSelector]);
}
