"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

import type { DataTableDensity } from "./types";

export const VIRTUAL_ROW_HEIGHT: Record<DataTableDensity, number> = {
  compact: 36,
  comfortable: 48,
  spacious: 56,
};

export type UseTableVirtualizationOptions = {
  enabled: boolean;
  count: number;
  scrollElement: HTMLElement | null;
  density: DataTableDensity;
  estimateSize?: number;
  overscan?: number;
};

export function useTableVirtualization({
  enabled,
  count,
  scrollElement,
  density,
  estimateSize,
  overscan = 8,
}: UseTableVirtualizationOptions) {
  const rowHeight = estimateSize ?? VIRTUAL_ROW_HEIGHT[density];

  const virtualizer = useVirtualizer({
    count: enabled ? count : 0,
    getScrollElement: () => scrollElement,
    estimateSize: () => rowHeight,
    overscan,
    enabled,
  });

  const virtualRows = enabled ? virtualizer.getVirtualItems() : [];
  const totalSize = enabled ? virtualizer.getTotalSize() : 0;
  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  return {
    enabled,
    virtualizer,
    virtualRows,
    totalSize,
    paddingTop,
    paddingBottom,
    rowHeight,
  };
}
