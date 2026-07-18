import type * as React from "react";
import type { Placement } from "@floating-ui/react";

export type SortDirection = "asc" | "desc";

export type DataTableSort = {
  key: string;
  direction: SortDirection;
};

export type DataTableFilters = Record<string, string>;

export type DataTableColumnWidths = Record<string, number>;

export type DataTableMode = "client" | "server";

export type DataTableRadius = "none" | "xs" | "sm" | "md";

export type DataTableDensity = "compact" | "comfortable" | "spacious";

export type DataTableState = {
  page: number;
  pageSize: number;
  sort: DataTableSort[];
  filters: DataTableFilters;
  density: DataTableDensity;
  columnWidths: DataTableColumnWidths;
};

export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  hideBelow?: "sm" | "md" | "lg";
  /**
   * Soft-wrap cell text. When true, truncate is ignored.
   */
  wrap?: boolean;
  /**
   * Show ellipsis (…) when content overflows.
   * Defaults to `true` when `wrap` is not set.
   */
  truncate?: boolean;
  /** Opt-in sticky column. Off unless set. */
  sticky?: boolean;
  /** Opt-in resize for this column when global `resizable` is on. Defaults to true. */
  resizable?: boolean;
  /** Preferred / initial width in px. */
  width?: number;
  /** Minimum width in px (resize + layout). */
  minWidth?: number;
  /** Maximum width in px (resize + layout). */
  maxWidth?: number;
  filterable?: boolean;
  filterType?: "text" | "select";
  filterOptions?: string[];
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableClassNames = {
  root?: string;
  table?: string;
  header?: string;
  headerRow?: string;
  headerCell?: string;
  body?: string;
  row?: string;
  cell?: string;
  pagination?: string;
  filterBar?: string;
  toolbar?: string;
  densityControl?: string;
};

/**
 * All behavioral features are opt-in via props.
 * Defaults keep the table plain: no sticky columns/header, no filters, no resize UI.
 */
export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];

  // Pagination
  showPagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];

  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  // Sticky (all off by default — no sticky rows/columns unless enabled)
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;

  // Layout
  minTableWidth?: string;
  maxHeight?: string;
  emptyMessage?: string;
  getRowId?: (row: T, index: number) => string;

  // Sorting
  enableMultiSort?: boolean;
  sort?: DataTableSort[];
  defaultSort?: DataTableSort[];
  onSortChange?: (sort: DataTableSort[]) => void;

  // Filtering (off by default)
  enableFiltering?: boolean;
  filters?: DataTableFilters;
  defaultFilters?: DataTableFilters;
  onFiltersChange?: (filters: DataTableFilters) => void;

  // Column resize (off by default)
  resizable?: boolean;
  columnWidths?: DataTableColumnWidths;
  defaultColumnWidths?: DataTableColumnWidths;
  onColumnWidthsChange?: (widths: DataTableColumnWidths) => void;

  // Density
  density?: DataTableDensity;
  defaultDensity?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  /** Built-in density control inside the package toolbar. */
  showDensityControl?: boolean;

  // Row interaction
  activeRowId?: string | null;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
  renderRowActions?: (row: T) => React.ReactNode;
  popoverOffset?: number;
  popoverPlacement?: Placement;

  // Server / client
  mode?: DataTableMode;
  totalRows?: number;
  loading?: boolean;
  onStateChange?: (state: DataTableState) => void;

  // Style
  radius?: DataTableRadius;
  className?: string;
  style?: React.CSSProperties;
  classNames?: DataTableClassNames;
  /** Extra toolbar content (rendered beside built-in density control when enabled). */
  toolbar?: React.ReactNode;
};

export const DENSITY_OPTIONS: {
  value: DataTableDensity;
  label: string;
}[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

export const RADIUS_CLASS: Record<DataTableRadius, string> = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
};

export const DENSITY_CELL_CLASS: Record<DataTableDensity, string> = {
  compact: "px-2 py-1 text-xs leading-5",
  comfortable: "px-3 py-2.5 text-sm leading-5",
  spacious: "px-4 py-3.5 text-sm leading-6",
};

export const DENSITY_HEADER_CLASS: Record<DataTableDensity, string> = {
  compact: "h-8 px-2 text-xs",
  comfortable: "h-11 px-3 text-sm",
  spacious: "h-12 px-4 text-sm",
};

export const HIDE_BELOW_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

export const DEFAULT_COLUMN_MIN_WIDTH = 80;
export const DEFAULT_COLUMN_WIDTH = 160;

/** Resolve layout styles from column size props + optional live resize width. */
export function getColumnSizeStyle(
  column: {
    width?: number;
    minWidth?: number;
    maxWidth?: number;
  },
  resizedWidth?: number,
): React.CSSProperties {
  const width = resizedWidth ?? column.width;
  const minWidth = column.minWidth ?? width;
  const maxWidth = column.maxWidth;

  const style: React.CSSProperties = {};
  if (width != null) style.width = width;
  if (minWidth != null) style.minWidth = minWidth;
  if (maxWidth != null) style.maxWidth = maxWidth;
  // Keep truncated cells constrained so ellipsis can appear in table layout.
  if (maxWidth == null && width != null) style.maxWidth = width;
  return style;
}

export function shouldTruncateColumn(column: {
  wrap?: boolean;
  truncate?: boolean;
}): boolean {
  if (column.wrap) return false;
  return column.truncate !== false;
}

export function normalizeSort(
  value: DataTableSort | DataTableSort[] | null | undefined,
): DataTableSort[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Cycle a column through asc → desc → removed. Preserves other sort keys. */
export function cycleMultiSort(
  current: DataTableSort[],
  key: string,
  options?: { replace?: boolean },
): DataTableSort[] {
  const replace = options?.replace ?? false;
  const existing = current.find((item) => item.key === key);

  if (replace) {
    if (!existing) return [{ key, direction: "asc" }];
    if (existing.direction === "asc") return [{ key, direction: "desc" }];
    return [];
  }

  if (!existing) return [...current, { key, direction: "asc" }];
  if (existing.direction === "asc") {
    return current.map((item) =>
      item.key === key ? { key, direction: "desc" } : item,
    );
  }
  return current.filter((item) => item.key !== key);
}
