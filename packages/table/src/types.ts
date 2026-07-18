import type * as React from "react";
import type { Placement } from "@floating-ui/react";

import type { FilterCondition } from "./filter-builder/types";

export type {
  FilterBuilderApplyPayload,
  FilterBuilderColumn,
  FilterColumnType,
  FilterCondition,
  FilterLogic,
  FilterOperatorValue,
} from "./filter-builder/types";

export type SortDirection = "asc" | "desc";

export type DataTableSort = {
  key: string;
  direction: SortDirection;
};

export type DataTableFilters = Record<string, string>;

export type DataTableColumnWidths = Record<string, number>;

/** `false` hides the column; missing key or `true` means visible. */
export type DataTableColumnVisibility = Record<string, boolean>;

export type DataTableMode = "client" | "server";

/** Alias used specifically for pagination data sourcing. */
export type DataTablePaginationMode = DataTableMode;

export type DataTablePaginationOptions = {
  /** Show the rows-per-page select. Defaults to `true`. */
  showPageSizeOptions?: boolean;
  /** Choices for the rows-per-page select. */
  pageSizeOptions?: number[];
  /** Show numbered page buttons. Defaults to `true`. */
  showPageNumbers?: boolean;
  /** Max numbered buttons in the sliding window. Defaults to `3`. */
  maxVisiblePages?: number;
  /** Show “Showing X–Y of Z”. Defaults to `true`. */
  showTotal?: boolean;
  /** Label beside the page-size select. Defaults to `"Rows"`. */
  rowsLabel?: string;
  /** Show previous / next buttons. Defaults to `true`. */
  showPrevNext?: boolean;
};

/** How row actions render in the actions column. */
export type DataTableActionsDisplay = "menu" | "icons";

export type DataTableActionsOptions<T> = {
  /**
   * `menu` — only the ⋯ popover (all visible actions inside).
   * `icons` — only inline icon buttons (no ⋯ menu).
   * Defaults to `"menu"`. A table never mixes both.
   */
  display?: DataTableActionsDisplay;
  /**
   * Allowed permission keys, or a map of permission → allowed.
   * Used when an action sets `permission` as a string.
   */
  permissions?: string[] | Record<string, boolean>;
  /** Custom permission check (wins over `permissions`). */
  canAccess?: (permission: string, row: T) => boolean;
  /** Sticky the actions column while scrolling horizontally. Defaults to `true`. */
  sticky?: boolean;
  menuAriaLabel?: string;
};

/** Declarative row action for the actions column. */
export type DataTableRowAction<T> = {
  id?: string;
  label: string;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  icon?: React.ReactNode;
  disabled?: boolean | ((row: T) => boolean);
  /**
   * Show condition. When `false`, the action is omitted.
   * Prefer this over `hidden` for positive “when to show” logic.
   */
  show?: boolean | ((row: T) => boolean);
  /** Hide when `true` (inverse of `show`). */
  hidden?: boolean | ((row: T) => boolean);
  /**
   * Permission key or predicate. String keys are checked via
   * `actionsOptions.canAccess` / `actionsOptions.permissions`.
   */
  permission?: string | ((row: T) => boolean);
};

export type DataTableRadius = "none" | "xs" | "sm" | "md";

export type DataTableDensity = "compact" | "comfortable" | "spacious";

export type DataTablePinnedColumns = {
  left?: string[];
  right?: string[];
};

export type DataTableState = {
  page: number;
  pageSize: number;
  sort: DataTableSort[];
  filters: DataTableFilters;
  density: DataTableDensity;
  columnWidths: DataTableColumnWidths;
  columnVisibility: DataTableColumnVisibility;
  columnOrder: string[];
  pinnedColumns: DataTablePinnedColumns;
  quickFilter: string;
  advancedFilters: FilterCondition[];
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
  /** Opt-in sticky column. Off unless set. Prefer `pinned` for Phase 2 pin sides. */
  sticky?: boolean;
  /** Pin column to an edge while scrolling horizontally. */
  pinned?: "left" | "right";
  /** Opt-in resize for this column when global `resizable` is on. Defaults to true. */
  resizable?: boolean;
  /** Preferred / initial width in px. */
  width?: number;
  /** Minimum width in px (resize + layout). */
  minWidth?: number;
  /** Maximum width in px (resize + layout). */
  maxWidth?: number;
  filterable?: boolean;
  /**
   * Value editor type for the filter builder / filter bar.
   * Legacy aliases: `text` → `string`, `select` → `enum`.
   */
  filterType?:
    | "text"
    | "select"
    | "string"
    | "textarea"
    | "number"
    | "range"
    | "date"
    | "datetime"
    | "time"
    | "boolean"
    | "email"
    | "url"
    | "color"
    | "enum"
    | "multi";
  filterOptions?: string[];
  filterMin?: number;
  filterMax?: number;
  filterStep?: number;
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
  filterBuilder?: string;
  toolbar?: string;
  densityControl?: string;
  quickFilter?: string;
  columnSelector?: string;
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
  /** @deprecated Prefer `paginationOptions.pageSizeOptions`. */
  pageSizeOptions?: number[];
  /**
   * Pagination data mode: `"client"` slices locally, `"server"` expects the
   * parent to supply the current page of `data` (+ `totalRows`).
   * Prefer this over `mode` when only pagination sourcing matters.
   */
  paginationMode?: DataTablePaginationMode;
  /** Fine-grained pagination UI options. */
  paginationOptions?: DataTablePaginationOptions;

  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  /**
   * Auto serial-number column. Computed by the table — do not put `sn` in row data.
   * Defaults to `true` (notable default-on behavior; pass `sn={false}` to opt out).
   */
  sn?: boolean;
  /** Header label for the SN column. */
  snHeader?: string;

  /**
   * Stick column headers while scrolling the table body (MUI DataGrid–style).
   * Requires a scroll container — when enabled without `maxHeight`, defaults to `28rem`.
   */
  stickyHeader?: boolean;
  /** @deprecated Prefer `stickyHeader`. Alias kept for clarity (“sticky heading”). */
  stickyHeading?: boolean;
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

  // Column filtering (per-column filter bar, off by default)
  enableFiltering?: boolean;
  filters?: DataTableFilters;
  defaultFilters?: DataTableFilters;
  onFiltersChange?: (filters: DataTableFilters) => void;

  /**
   * Advanced multi-condition filter builder (toolbar popover).
   * Only columns with `filterable: true` appear in the builder.
   */
  showFilterBuilder?: boolean;
  advancedFilters?: FilterCondition[];
  defaultAdvancedFilters?: FilterCondition[];
  onAdvancedFiltersChange?: (conditions: FilterCondition[]) => void;
  onFilterBuilderApply?: (payload: {
    conditions: FilterCondition[];
    params: URLSearchParams | null;
  }) => void;

  // Quick filter (global search across visible columns)
  enableQuickFilter?: boolean;
  quickFilter?: string;
  defaultQuickFilter?: string;
  onQuickFilterChange?: (value: string) => void;
  quickFilterPlaceholder?: string;

  // Column visibility
  columnVisibility?: DataTableColumnVisibility;
  defaultColumnVisibility?: DataTableColumnVisibility;
  onColumnVisibilityChange?: (visibility: DataTableColumnVisibility) => void;
  /** Show Columns menu in the toolbar. */
  showColumnSelector?: boolean;

  // Phase 2 — column order / pin / header menu
  /** Enable drag-to-reorder column headers. */
  reorderable?: boolean;
  columnOrder?: string[];
  defaultColumnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  pinnedColumns?: DataTablePinnedColumns;
  defaultPinnedColumns?: DataTablePinnedColumns;
  onPinnedColumnsChange?: (pinned: DataTablePinnedColumns) => void;
  /** Show ⋮ menu on each data column header (sort / pin / hide). */
  showColumnMenu?: boolean;

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
  /**
   * Declarative row actions — rendered as a ⋯ menu and/or icon buttons
   * depending on `actionsDisplay` / `actionsOptions`.
   */
  actions?:
    | DataTableRowAction<T>[]
    | ((row: T) => DataTableRowAction<T>[]);
  /**
   * `menu` | `icons`. Shorthand for `actionsOptions.display`.
   * Defaults to `"menu"`. Never mixes both in one table.
   */
  actionsDisplay?: DataTableActionsDisplay;
  /** Permissions, display mode, sticky, and other action-column options. */
  actionsOptions?: DataTableActionsOptions<T>;
  /** Custom row-actions content (escape hatch). Ignored when `actions` is set. */
  renderRowActions?: (row: T) => React.ReactNode;
  popoverOffset?: number;
  popoverPlacement?: Placement;

  // Server / client
  /**
   * Table data mode (sort/filter/page). Prefer `paginationMode` when you only
   * need to control pagination sourcing. `paginationMode` wins when both set.
   */
  mode?: DataTableMode;
  totalRows?: number;
  loading?: boolean;
  onStateChange?: (state: DataTableState) => void;

  // Style
  radius?: DataTableRadius;
  className?: string;
  style?: React.CSSProperties;
  classNames?: DataTableClassNames;
  /** Horizontal border between rows. Defaults to `true`. */
  showRowBorders?: boolean;
  /** Vertical border between columns. Defaults to `false`. */
  showColumnBorders?: boolean;
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

export function isColumnVisible(
  visibility: DataTableColumnVisibility,
  key: string,
): boolean {
  return visibility[key] !== false;
}

export function getVisibleColumns<T>(
  columns: DataTableColumn<T>[],
  visibility: DataTableColumnVisibility,
): DataTableColumn<T>[] {
  return columns.filter((column) => isColumnVisible(visibility, column.key));
}

/** Apply optional columnOrder, then visibility. */
export function orderColumns<T>(
  columns: DataTableColumn<T>[],
  order: string[],
): DataTableColumn<T>[] {
  if (order.length === 0) return columns;
  const byKey = new Map(columns.map((column) => [column.key, column]));
  const ordered: DataTableColumn<T>[] = [];
  for (const key of order) {
    const column = byKey.get(key);
    if (column) {
      ordered.push(column);
      byKey.delete(key);
    }
  }
  for (const column of byKey.values()) ordered.push(column);
  return ordered;
}

export function resolvePinnedSide(
  key: string,
  pinnedColumns: DataTablePinnedColumns,
  columnPinned?: "left" | "right",
): "left" | "right" | false {
  if (pinnedColumns.left?.includes(key)) return "left";
  if (pinnedColumns.right?.includes(key)) return "right";
  if (columnPinned) return columnPinned;
  return false;
}

/**
 * Move left-pinned columns to the front and right-pinned to the end
 * (after checkbox/SN are accounted for separately in the table).
 */
export function applyPinOrder<T>(
  columns: DataTableColumn<T>[],
  pinnedColumns: DataTablePinnedColumns,
): DataTableColumn<T>[] {
  const left: DataTableColumn<T>[] = [];
  const center: DataTableColumn<T>[] = [];
  const right: DataTableColumn<T>[] = [];

  for (const column of columns) {
    const side = resolvePinnedSide(
      column.key,
      pinnedColumns,
      column.pinned ?? (column.sticky ? "left" : undefined),
    );
    if (side === "left") left.push(column);
    else if (side === "right") right.push(column);
    else center.push(column);
  }

  const sortByPinList = (
    group: DataTableColumn<T>[],
    list: string[] | undefined,
  ) => {
    if (!list?.length) return group;
    return [...group].sort((a, b) => {
      const ai = list.indexOf(a.key);
      const bi = list.indexOf(b.key);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  };

  return [
    ...sortByPinList(left, pinnedColumns.left),
    ...center,
    ...sortByPinList(right, pinnedColumns.right),
  ];
}

export function resolveRowActions<T>(
  actions:
    | DataTableRowAction<T>[]
    | ((row: T) => DataTableRowAction<T>[])
    | undefined,
  row: T,
  options?: Pick<DataTableActionsOptions<T>, "permissions" | "canAccess">,
): DataTableRowAction<T>[] {
  if (!actions) return [];
  const list = typeof actions === "function" ? actions(row) : actions;
  return list.filter((action) => isRowActionVisible(action, row, options));
}

export function isRowActionVisible<T>(
  action: DataTableRowAction<T>,
  row: T,
  options?: Pick<DataTableActionsOptions<T>, "permissions" | "canAccess">,
): boolean {
  if (action.show !== undefined) {
    const shown =
      typeof action.show === "function" ? action.show(row) : action.show;
    if (!shown) return false;
  }

  if (action.hidden !== undefined) {
    const hidden =
      typeof action.hidden === "function"
        ? action.hidden(row)
        : Boolean(action.hidden);
    if (hidden) return false;
  }

  if (action.permission !== undefined) {
    if (typeof action.permission === "function") {
      if (!action.permission(row)) return false;
    } else if (!hasActionPermission(action.permission, row, options)) {
      return false;
    }
  }

  return true;
}

export function hasActionPermission<T>(
  permission: string,
  row: T,
  options?: Pick<DataTableActionsOptions<T>, "permissions" | "canAccess">,
): boolean {
  if (options?.canAccess) return options.canAccess(permission, row);

  const perms = options?.permissions;
  if (perms == null) return true;
  if (Array.isArray(perms)) return perms.includes(permission);
  return perms[permission] === true;
}

export function splitRowActionsByDisplay<T>(
  actions: DataTableRowAction<T>[],
  display: DataTableActionsDisplay = "menu",
): { iconActions: DataTableRowAction<T>[]; menuActions: DataTableRowAction<T>[] } {
  if (display === "icons") {
    return { iconActions: actions, menuActions: [] };
  }
  return { iconActions: [], menuActions: actions };
}

export function isRowActionDisabled<T>(
  action: DataTableRowAction<T>,
  row: T,
): boolean {
  return typeof action.disabled === "function"
    ? action.disabled(row)
    : Boolean(action.disabled);
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
