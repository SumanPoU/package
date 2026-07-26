"use client";

import { type RefObject, useEffect, useLayoutEffect } from "react";

/**
 * Keep the active docs nav link visible inside a sticky overflow sidebar.
 * Uses a ref (not document.querySelector) so every package page scrolls reliably.
 */
export function useScrollNavToActive(
  activeId: string,
  sidebarRef: RefObject<HTMLElement | null>,
): void {
  useLayoutEffect(() => {
    if (!activeId) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const link = sidebar.querySelector<HTMLElement>(
      `[data-nav-id="${activeId.replace(/"/g, "")}"]`,
    );
    if (!link) return;

    const sidebarRect = sidebar.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const pad = 20;
    const inView =
      linkRect.top >= sidebarRect.top + pad &&
      linkRect.bottom <= sidebarRect.bottom - pad;

    if (inView) return;

    // Position active item ~30% from the top of the sidebar scroller.
    const delta =
      linkRect.top -
      sidebarRect.top -
      sidebar.clientHeight * 0.3 +
      linkRect.height / 2;

    sidebar.scrollTo({
      top: Math.max(0, sidebar.scrollTop + delta),
      behavior: "smooth",
    });
  }, [activeId, sidebarRef]);

  // Hash navigation (clicking a nav link / landing with #section).
  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const sidebar = sidebarRef.current;
      if (!sidebar) return;
      const link = sidebar.querySelector<HTMLElement>(
        `[data-nav-id="${id.replace(/"/g, "")}"]`,
      );
      if (!link) return;
      const sidebarRect = sidebar.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const delta =
        linkRect.top -
        sidebarRect.top -
        sidebar.clientHeight * 0.3 +
        linkRect.height / 2;
      sidebar.scrollTo({
        top: Math.max(0, sidebar.scrollTop + delta),
        behavior: "smooth",
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [sidebarRef]);
}
