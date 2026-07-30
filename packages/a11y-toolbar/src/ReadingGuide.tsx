"use client";

import { useEffect, useRef } from "react";

import { A11Y_TOOLBAR_ATTR } from "./types";

/**
 * Horizontal reading band that follows the pointer.
 * Mounted outside the dialog; excluded from toolbar chrome hit-testing.
 */
export function ReadingGuide({ active }: { active: boolean }) {
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const band = bandRef.current;
    if (!band) return;

    const place = (clientY: number) => {
      const h = band.offsetHeight || 48;
      band.style.transform = `translateY(${clientY - h / 2}px)`;
      band.style.opacity = "1";
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[${A11Y_TOOLBAR_ATTR}]`)) return;
      place(event.clientY);
    };

    const onLeave = () => {
      band.style.opacity = "0";
    };

    // Center on first paint so the band is visible before the first move.
    place(window.innerHeight / 2);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={bandRef}
      className="itzsa-a11y-reading-guide"
      aria-hidden
      style={{ opacity: 0 }}
    />
  );
}
