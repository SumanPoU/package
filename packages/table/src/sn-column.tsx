"use client";

import type * as React from "react";

import { TableCell, TableHead } from "./components/ui/table";
import { cn } from "./lib/utils";

/** Fixed width for the auto SN column — kept tight across densities. */
export const SN_COLUMN_WIDTH = 52;

export type SnHeaderProps = {
  label: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Isolated SN header so Phase 2 column-menu/reorder/pin can treat SN as a
 * special non-configurable column without touching data-column render paths.
 */
export function SnHeader({ label, className, style }: SnHeaderProps) {
  return (
    <TableHead
      data-slot="data-table-sn-header"
      className={cn(
        "w-[52px] max-w-[52px] min-w-[52px] bg-card px-1.5 text-center text-xs font-medium text-muted-foreground",
        className,
      )}
      style={{
        width: SN_COLUMN_WIDTH,
        minWidth: SN_COLUMN_WIDTH,
        maxWidth: SN_COLUMN_WIDTH,
        ...style,
      }}
    >
      {label}
    </TableHead>
  );
}

export type SnCellProps = {
  value: number;
  className?: string;
  style?: React.CSSProperties;
};

export function SnCell({ value, className, style }: SnCellProps) {
  return (
    <TableCell
      data-slot="data-table-sn-cell"
      className={cn(
        "w-[52px] max-w-[52px] min-w-[52px] bg-card px-1.5 text-center tabular-nums text-xs text-muted-foreground",
        className,
      )}
      style={{
        width: SN_COLUMN_WIDTH,
        minWidth: SN_COLUMN_WIDTH,
        maxWidth: SN_COLUMN_WIDTH,
        ...style,
      }}
    >
      {value}
    </TableCell>
  );
}

/**
 * Global serial number for the current result page.
 *
 * Uses display-order page position: (page - 1) * pageSize + rowIndexOnPage + 1.
 * This is intentionally NOT the original data-array index after sort/filter —
 * SN follows what the user sees on screen across pages (MUI-style row numbering).
 */
export function getSerialNumber(
  page: number,
  pageSize: number,
  rowIndexOnPage: number,
): number {
  return (page - 1) * pageSize + rowIndexOnPage + 1;
}
