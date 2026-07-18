import type * as React from "react";
import type { Placement } from "@floating-ui/react";

export type SortDirection = "asc" | "desc";

export type DataTableSort = {
  key: string;
  direction: SortDirection;
};

export type DataTableFilters = Record<string, string>;

export type DataTableMode = "client" | "server";

export type DataTableRadius = "none" | "xs" | "sm" | "md";

export type DataTableDensity = "compact" | "comfortable" | "spacious";

export type DataTableState = {
  page: number;
  pageSize: number;
  sort: DataTableSort[];
  filters: DataTableFilters;
};

export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  hideBelow?: "sm" | "md" | "lg";
  /** Soft-wrap cell text instead of forcing nowrap (helps narrow screens). */
  wrap?: boolean;
  /** Stick this column to the left while scrolling horizontally. */
  sticky?: boolean;
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
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  selectable?: boolean;
  stickyHeader?: boolean;
  /** Stick the first data column (and checkbox) during horizontal scroll. */
  stickyFirstColumn?: boolean;
  /** Minimum table width before horizontal scroll kicks in. */
  minTableWidth?: string;
  maxHeight?: string;
  emptyMessage?: string;
  getRowId?: (row: T, index: number) => string;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Multi-column sort (ordered by priority). */
  sort?: DataTableSort[];
  defaultSort?: DataTableSort[];
  onSortChange?: (sort: DataTableSort[]) => void;
  /** Opt-in filter bar. Off by default. */
  enableFiltering?: boolean;
  filters?: DataTableFilters;
  defaultFilters?: DataTableFilters;
  onFiltersChange?: (filters: DataTableFilters) => void;
  activeRowId?: string | null;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  classNames?: DataTableClassNames;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
  radius?: DataTableRadius;
  mode?: DataTableMode;
  totalRows?: number;
  loading?: boolean;
  onStateChange?: (state: DataTableState) => void;
  popoverOffset?: number;
  popoverPlacement?: Placement;
  renderRowActions?: (row: T) => React.ReactNode;
  density?: DataTableDensity;
  /** Optional toolbar rendered above the table (e.g. density controls). */
  toolbar?: React.ReactNode;
};

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
