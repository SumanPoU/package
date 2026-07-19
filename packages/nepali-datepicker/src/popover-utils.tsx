import * as React from "react";

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function Chevron({
  dir,
  className,
}: {
  dir: "left" | "right" | "down";
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : dir === "right" ? (
        <path d="M9 18l6-6-6-6" />
      ) : (
        <path d="M6 9l6 6 6-6" />
      )}
    </svg>
  );
}

export function usePortalReady() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}

export type PopoverPos = { top: number; left: number; width: number };

export function useFloatingPopover(
  open: boolean,
  anchorRef: React.RefObject<HTMLElement | null>,
  opts?: { minWidth?: number; estimatedHeight?: number },
) {
  const minWidth = opts?.minWidth ?? 280;
  const estimatedHeight = opts?.estimatedHeight ?? 340;
  const [pos, setPos] = React.useState<PopoverPos>({
    top: 0,
    left: 0,
    width: minWidth,
  });

  const updatePosition = React.useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(minWidth, rect.width);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    const below = rect.bottom + 6;
    const top =
      below + estimatedHeight > window.innerHeight && rect.top > estimatedHeight
        ? rect.top - estimatedHeight - 6
        : below;
    setPos({ top, left, width });
  }, [anchorRef, minWidth, estimatedHeight]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, updatePosition]);

  return { pos, updatePosition };
}

export function useDismissOnOutside(
  open: boolean,
  onClose: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>,
) {
  const refsRef = React.useRef(refs);
  refsRef.current = refs;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      for (const ref of refsRef.current) {
        if (ref.current?.contains(t)) return;
      }
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onClose]);
}
