"use client";

import * as React from "react";

import {
  DEFAULT_COLUMN_MIN_WIDTH,
  DEFAULT_COLUMN_WIDTH,
  type DataTableColumn,
  type DataTableColumnWidths,
} from "./types";

export type UseColumnResizeOptions<T> = {
  columns: DataTableColumn<T>[];
  enabled?: boolean;
  columnWidths?: DataTableColumnWidths;
  defaultColumnWidths?: DataTableColumnWidths;
  onColumnWidthsChange?: (widths: DataTableColumnWidths) => void;
};

export type UseColumnResizeReturn = {
  widths: DataTableColumnWidths;
  getWidth: (
    key: string,
    column?: { width?: number; minWidth?: number },
  ) => number;
  setWidth: (
    key: string,
    width: number,
    options?: { minWidth?: number; maxWidth?: number },
  ) => void;
  beginResize: (
    key: string,
    event: React.MouseEvent | React.TouchEvent,
    options?: { minWidth?: number; maxWidth?: number },
  ) => void;
  isResizing: boolean;
};

function initialWidths<T>(
  columns: DataTableColumn<T>[],
  seed: DataTableColumnWidths = {},
): DataTableColumnWidths {
  const next: DataTableColumnWidths = { ...seed };
  for (const column of columns) {
    if (next[column.key] == null) {
      next[column.key] = column.width ?? DEFAULT_COLUMN_WIDTH;
    }
  }
  return next;
}

export function useColumnResize<T>({
  columns,
  enabled = false,
  columnWidths: controlledWidths,
  defaultColumnWidths = {},
  onColumnWidthsChange,
}: UseColumnResizeOptions<T>): UseColumnResizeReturn {
  const [uncontrolledWidths, setUncontrolledWidths] =
    React.useState<DataTableColumnWidths>(() =>
      initialWidths(columns, defaultColumnWidths),
    );
  const [isResizing, setIsResizing] = React.useState(false);

  const isControlled = controlledWidths !== undefined;
  const widths = isControlled
    ? initialWidths(columns, controlledWidths)
    : uncontrolledWidths;

  const widthsRef = React.useRef(widths);
  widthsRef.current = widths;

  React.useEffect(() => {
    if (isControlled) return;
    setUncontrolledWidths((prev) => initialWidths(columns, prev));
  }, [columns, isControlled]);

  const commitWidths = React.useCallback(
    (next: DataTableColumnWidths) => {
      widthsRef.current = next;
      if (!isControlled) setUncontrolledWidths(next);
      onColumnWidthsChange?.(next);
    },
    [isControlled, onColumnWidthsChange],
  );

  const getWidth = React.useCallback(
    (key: string, column?: { width?: number; minWidth?: number }) => {
      return (
        widthsRef.current[key] ??
        column?.width ??
        Math.max(
          column?.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH,
          DEFAULT_COLUMN_WIDTH,
        )
      );
    },
    [],
  );

  const setWidth = React.useCallback(
    (
      key: string,
      width: number,
      options?: { minWidth?: number; maxWidth?: number },
    ) => {
      const minWidth = options?.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH;
      const maxWidth = options?.maxWidth ?? Number.POSITIVE_INFINITY;
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, Math.round(width)),
      );
      commitWidths({ ...widthsRef.current, [key]: nextWidth });
    },
    [commitWidths],
  );

  const beginResize = React.useCallback(
    (
      key: string,
      event: React.MouseEvent | React.TouchEvent,
      options?: { minWidth?: number; maxWidth?: number },
    ) => {
      if (!enabled) return;

      event.preventDefault();
      event.stopPropagation();

      const startX =
        "touches" in event ? event.touches[0]?.clientX ?? 0 : event.clientX;
      const startWidth = getWidth(key);
      const minWidth = options?.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH;
      const maxWidth = options?.maxWidth ?? Number.POSITIVE_INFINITY;

      setIsResizing(true);

      const onMove = (clientX: number) => {
        setWidth(key, startWidth + (clientX - startX), { minWidth, maxWidth });
      };

      const onMouseMove = (moveEvent: MouseEvent) => onMove(moveEvent.clientX);
      const onTouchMove = (moveEvent: TouchEvent) => {
        const x = moveEvent.touches[0]?.clientX;
        if (x != null) onMove(x);
      };

      const onEnd = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onEnd);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    },
    [enabled, getWidth, setWidth],
  );

  return { widths, getWidth, setWidth, beginResize, isResizing };
}
