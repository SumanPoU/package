"use client";

import * as React from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { DensityControl } from "./density-control";
import { CellContent } from "./cell-content";
import { ColumnVisibilityMenu } from "./column-visibility-menu";
import { EditableCell } from "./editable-cell";
import { FilterBar } from "./filter-bar";
import { FilterBuilderMenu } from "./filter-builder";
import {
  matchesFilterConditions,
  toFilterBuilderColumns,
} from "./filter-builder/types";
import { cn } from "./lib/utils";
import { QuickFilter } from "./quick-filter";
import { RowActions } from "./row-actions";
import {
  SN_COLUMN_WIDTH,
  SnCell,
  SnHeader,
  getSerialNumber,
} from "./sn-column";
import { TablePagination } from "./table-pagination";
import {
  DENSITY_CELL_CLASS,
  DENSITY_HEADER_CLASS,
  HIDE_BELOW_CLASS,
  RADIUS_CLASS,
  applyPinOrder,
  cycleMultiSort,
  getColumnSizeStyle,
  getVisibleColumns,
  isColumnVisible,
  normalizeSort,
  orderColumns,
  resolvePinnedSide,
  resolveRowActions,
  shouldTruncateColumn,
  type DataTableColumn,
  type DataTableColumnVisibility,
  type DataTableDensity,
  type DataTableFilters,
  type DataTablePinnedColumns,
  type DataTableProps,
  type DataTableSort,
  type DataTableState,
  type FilterCondition,
  type SortDirection,
} from "./types";
import { useColumnResize } from "./use-column-resize";
import { useTableEditing } from "./use-table-editing";
import { useTableSelection } from "./use-table-selection";
import { useTableVirtualization } from "./use-table-virtualization";
import { ColumnHeaderMenu } from "./column-header-menu";

export type {
  DataTableActionsDisplay,
  DataTableActionsOptions,
  DataTableClassNames,
  DataTableColumn,
  DataTableColumnVisibility,
  DataTableColumnWidths,
  DataTableDensity,
  DataTableFilters,
  DataTableMode,
  DataTablePaginationMode,
  DataTablePaginationOptions,
  DataTablePinnedColumns,
  DataTableProps,
  DataTableRadius,
  DataTableRowAction,
  DataTableSort,
  DataTableState,
  FilterCondition,
  SortDirection,
} from "./types";

export {
  DENSITY_OPTIONS,
  applyPinOrder,
  cycleMultiSort,
  getColumnSizeStyle,
  getVisibleColumns,
  hasActionPermission,
  isColumnVisible,
  isRowActionDisabled,
  isRowActionVisible,
  normalizeSort,
  orderColumns,
  resolvePinnedSide,
  resolveRowActions,
  shouldTruncateColumn,
  splitRowActionsByDisplay,
} from "./types";

function matchesQuickFilter<T>(
  row: T,
  query: string,
  columns: { key: string }[],
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return columns.some((column) => {
    const value = getCellValue(row, column.key);
    return String(value ?? "")
      .toLowerCase()
      .includes(q);
  });
}

function defaultGetRowId<T>(row: T, index: number): string {
  if (
    row !== null &&
    typeof row === "object" &&
    "id" in row &&
    (typeof (row as { id: unknown }).id === "string" ||
      typeof (row as { id: unknown }).id === "number")
  ) {
    return String((row as { id: string | number }).id);
  }
  return String(index);
}

function getCellValue<T>(row: T, key: string): unknown {
  if (row !== null && typeof row === "object" && key in row) {
    return (row as Record<string, unknown>)[key];
  }
  return undefined;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function matchesFilters<T>(row: T, filters: DataTableFilters): boolean {
  return Object.entries(filters).every(([key, raw]) => {
    const query = String(raw ?? "").trim().toLowerCase();
    if (!query) return true;
    const value = getCellValue(row, key);
    return String(value ?? "")
      .toLowerCase()
      .includes(query);
  });
}

function sortRows<T>(rows: T[], sort: DataTableSort[]): T[] {
  if (sort.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const rule of sort) {
      const result = compareValues(
        getCellValue(a, rule.key),
        getCellValue(b, rule.key),
      );
      if (result !== 0) {
        return rule.direction === "asc" ? result : -result;
      }
    }
    return 0;
  });
}

export function DataTable<T>({
  data,
  columns,
  showPagination = true,
  pageSize: pageSizeProp = 10,
  pageSizeOptions,
  paginationMode,
  paginationOptions,
  selectable = false,
  sn = true,
  snHeader = "SN",
  stickyHeader = false,
  stickyHeading = false,
  stickyFirstColumn = false,
  minTableWidth,
  maxHeight,
  emptyMessage = "No results.",
  getRowId = defaultGetRowId,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  enableMultiSort = true,
  sort: controlledSort,
  defaultSort = [],
  onSortChange,
  enableFiltering = false,
  filters: controlledFilters,
  defaultFilters = {},
  onFiltersChange,
  showFilterBuilder = false,
  advancedFilters: controlledAdvancedFilters,
  defaultAdvancedFilters,
  onAdvancedFiltersChange,
  onFilterBuilderApply,
  enableQuickFilter = false,
  quickFilter: controlledQuickFilter,
  defaultQuickFilter = "",
  onQuickFilterChange,
  quickFilterPlaceholder = "Search…",
  columnVisibility: controlledVisibility,
  defaultColumnVisibility = {},
  onColumnVisibilityChange,
  showColumnSelector = false,
  reorderable = false,
  columnOrder: controlledOrder,
  defaultColumnOrder = [],
  onColumnOrderChange,
  pinnedColumns: controlledPinned,
  defaultPinnedColumns = {},
  onPinnedColumnsChange,
  showColumnMenu = false,
  resizable = false,
  columnWidths,
  defaultColumnWidths,
  onColumnWidthsChange,
  density: controlledDensity,
  defaultDensity = "compact",
  onDensityChange,
  showDensityControl = false,
  activeRowId = null,
  onRowClick,
  className,
  style,
  classNames,
  rowClassName,
  radius = "xs",
  mode = "client",
  totalRows,
  loading = false,
  onStateChange,
  popoverOffset = 8,
  popoverPlacement = "bottom-start",
  actions,
  actionsDisplay,
  actionsOptions,
  renderRowActions,
  showRowBorders = true,
  showColumnBorders = false,
  enableVirtualization = false,
  virtualRowHeight,
  virtualOverscan = 8,
  editable = false,
  editMode = "cell",
  editAllColumns = false,
  processRowUpdate,
  onProcessRowUpdateError,
  onCellEditStart,
  onCellEditStop,
  isCellEditable,
  toolbar,
}: DataTableProps<T>) {
  const resolvedMode = paginationMode ?? mode;
  const isServer = resolvedMode === "server";
  const radiusClass = RADIUS_CLASS[radius];
  const resolvedActionsDisplay =
    actionsDisplay ?? actionsOptions?.display ?? "menu";
  const actionsSticky = actionsOptions?.sticky ?? true;
  const showRowEditControls = editable && editMode === "row";
  const showActions =
    actions != null ||
    typeof renderRowActions === "function" ||
    showRowEditControls;
  const actionsColumnWidth =
    !showActions
      ? 0
      : typeof renderRowActions === "function" && actions == null
        ? 40
        : resolvedActionsDisplay === "icons"
          ? 108
          : 40;
  const stickyHeaderEnabled = stickyHeader || stickyHeading;
  const resolvedPageSizeOptions =
    paginationOptions?.pageSizeOptions ?? pageSizeOptions;
  const resolvedMaxHeight =
    maxHeight ??
    (stickyHeaderEnabled || enableVirtualization ? "28rem" : undefined);
  const showFilterBar =
    enableFiltering && columns.some((column) => column.filterable);
  const showToolbar =
    showDensityControl ||
    showColumnSelector ||
    enableQuickFilter ||
    showFilterBuilder ||
    toolbar != null;

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pageSizeProp);
  const [uncontrolledSort, setUncontrolledSort] = React.useState<DataTableSort[]>(
    normalizeSort(defaultSort),
  );
  const [uncontrolledFilters, setUncontrolledFilters] =
    React.useState<DataTableFilters>(defaultFilters);
  const [uncontrolledAdvancedFilters, setUncontrolledAdvancedFilters] =
    React.useState<FilterCondition[]>(defaultAdvancedFilters ?? []);
  const [uncontrolledDensity, setUncontrolledDensity] =
    React.useState<DataTableDensity>(defaultDensity);
  const [uncontrolledQuickFilter, setUncontrolledQuickFilter] =
    React.useState(defaultQuickFilter);
  const [uncontrolledVisibility, setUncontrolledVisibility] =
    React.useState<DataTableColumnVisibility>(defaultColumnVisibility);
  const [uncontrolledOrder, setUncontrolledOrder] =
    React.useState<string[]>(defaultColumnOrder);
  const [uncontrolledPinned, setUncontrolledPinned] =
    React.useState<DataTablePinnedColumns>(defaultPinnedColumns);
  const [draggingKey, setDraggingKey] = React.useState<string | null>(null);
  const [scrollElement, setScrollElement] = React.useState<HTMLDivElement | null>(
    null,
  );

  const isSortControlled = controlledSort !== undefined;
  const isFiltersControlled = controlledFilters !== undefined;
  const isAdvancedFiltersControlled = controlledAdvancedFilters !== undefined;
  const isDensityControlled = controlledDensity !== undefined;
  const isQuickFilterControlled = controlledQuickFilter !== undefined;
  const isVisibilityControlled = controlledVisibility !== undefined;
  const isOrderControlled = controlledOrder !== undefined;
  const isPinnedControlled = controlledPinned !== undefined;

  const sort = isSortControlled
    ? normalizeSort(controlledSort)
    : uncontrolledSort;
  const filters = isFiltersControlled
    ? controlledFilters
    : uncontrolledFilters;
  const advancedFilters = isAdvancedFiltersControlled
    ? controlledAdvancedFilters
    : uncontrolledAdvancedFilters;
  const density = isDensityControlled
    ? controlledDensity
    : uncontrolledDensity;
  const quickFilter = isQuickFilterControlled
    ? controlledQuickFilter
    : uncontrolledQuickFilter;
  const columnVisibility = isVisibilityControlled
    ? controlledVisibility
    : uncontrolledVisibility;
  const columnOrder = isOrderControlled ? controlledOrder : uncontrolledOrder;
  const pinnedColumns = isPinnedControlled
    ? controlledPinned
    : uncontrolledPinned;

  const visibleColumns = React.useMemo(() => {
    const ordered = orderColumns(columns, columnOrder);
    const visible = getVisibleColumns(ordered, columnVisibility);
    return applyPinOrder(visible, pinnedColumns);
  }, [columnOrder, columnVisibility, columns, pinnedColumns]);

  const leftPinnedKeys = React.useMemo(() => {
    const keys: string[] = [];
    for (const column of visibleColumns) {
      const side = resolvePinnedSide(
        column.key,
        pinnedColumns,
        column.pinned ?? (column.sticky ? "left" : undefined),
      );
      if (side === "left") keys.push(column.key);
    }
    return keys;
  }, [pinnedColumns, visibleColumns]);

  const rightPinnedKeys = React.useMemo(() => {
    const keys: string[] = [];
    for (const column of visibleColumns) {
      const side = resolvePinnedSide(
        column.key,
        pinnedColumns,
        column.pinned ?? (column.sticky ? "left" : undefined),
      );
      if (side === "right") keys.push(column.key);
    }
    return keys;
  }, [pinnedColumns, visibleColumns]);

  const rowBorderClass = showRowBorders
    ? "border-b border-black/[0.06] dark:border-white/[0.08]"
    : "border-b-0";
  const columnBorderClass = showColumnBorders
    ? "border-r border-black/[0.06] dark:border-white/[0.08]"
    : "border-r-0";
  const cellBorderClass = cn(rowBorderClass, columnBorderClass);

  const densityCell = DENSITY_CELL_CLASS[density];
  const densityHeader = DENSITY_HEADER_CLASS[density];

  const selection = useTableSelection({
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
  });

  const editing = useTableEditing<T>({
    editMode,
    getRowId,
    processRowUpdate,
    onProcessRowUpdateError,
    onCellEditStart,
    onCellEditStop,
    isCellEditable,
  });

  const isColumnEditable = React.useCallback(
    (column: DataTableColumn<T>) => {
      if (!editable) return false;
      if (editAllColumns) return column.editable !== false;
      return column.editable === true;
    },
    [editAllColumns, editable],
  );

  const resize = useColumnResize({
    columns: visibleColumns,
    enabled: resizable,
    columnWidths,
    defaultColumnWidths,
    onColumnWidthsChange,
  });

  const getColumnWidthPx = React.useCallback(
    (column: (typeof visibleColumns)[number]) =>
      resizable
        ? resize.getWidth(column.key, column)
        : (column.width ?? column.minWidth ?? 160),
    [resizable, resize],
  );

  const getPinnedLeftOffset = React.useCallback(
    (key: string) => {
      let left = selectable ? 40 : 0;
      left += sn ? SN_COLUMN_WIDTH : 0;
      for (const pinnedKey of leftPinnedKeys) {
        if (pinnedKey === key) return left;
        const column = visibleColumns.find((item) => item.key === pinnedKey);
        left += column ? getColumnWidthPx(column) : 160;
      }
      return left;
    },
    [
      getColumnWidthPx,
      leftPinnedKeys,
      selectable,
      sn,
      visibleColumns,
    ],
  );

  const getPinnedRightOffset = React.useCallback(
    (key: string) => {
      let right = showActions ? actionsColumnWidth : 0;
      for (let i = rightPinnedKeys.length - 1; i >= 0; i -= 1) {
        const pinnedKey = rightPinnedKeys[i]!;
        if (pinnedKey === key) return right;
        const column = visibleColumns.find((item) => item.key === pinnedKey);
        right += column ? getColumnWidthPx(column) : 160;
      }
      return right;
    },
    [
      actionsColumnWidth,
      getColumnWidthPx,
      rightPinnedKeys,
      showActions,
      visibleColumns,
    ],
  );

  const emitState = React.useCallback(
    (next: Partial<DataTableState>) => {
      onStateChange?.({
        page,
        pageSize,
        sort,
        filters,
        density,
        columnWidths: resize.widths,
        columnVisibility,
        columnOrder,
        pinnedColumns,
        quickFilter,
        advancedFilters,
        ...next,
      });
    },
    [
      advancedFilters,
      columnOrder,
      columnVisibility,
      density,
      filters,
      onStateChange,
      page,
      pageSize,
      pinnedColumns,
      quickFilter,
      resize.widths,
      sort,
    ],
  );

  React.useEffect(() => {
    setPageSize(pageSizeProp);
    setPage(1);
  }, [pageSizeProp]);

  const processedData = React.useMemo(() => {
    if (isServer) return data;

    let rows = data;

    if (enableFiltering) {
      rows = rows.filter((row) => matchesFilters(row, filters));
    }

    if (showFilterBuilder && advancedFilters.length > 0) {
      rows = rows.filter((row) =>
        matchesFilterConditions(row, advancedFilters, getCellValue),
      );
    }

    if (enableQuickFilter && quickFilter.trim()) {
      rows = rows.filter((row) =>
        matchesQuickFilter(row, quickFilter, visibleColumns),
      );
    }

    return sortRows(rows, sort);
  }, [
    advancedFilters,
    data,
    enableFiltering,
    enableQuickFilter,
    filters,
    isServer,
    quickFilter,
    showFilterBuilder,
    sort,
    visibleColumns,
  ]);

  const totalItems = isServer
    ? (totalRows ?? data.length)
    : processedData.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageRows = React.useMemo(() => {
    if (isServer) {
      return data.map((row, index) => {
        const id = getRowId(row, index);
        return {
          row: editing.getDisplayRow(row, id),
          index,
          id,
        };
      });
    }

    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize).map((row, index) => {
      const absoluteIndex = start + index;
      const id = getRowId(row, absoluteIndex);
      return {
        row: editing.getDisplayRow(row, id),
        index: absoluteIndex,
        id,
      };
    });
  }, [
    data,
    editing.getDisplayRow,
    editing.rowOverrides,
    getRowId,
    isServer,
    page,
    pageSize,
    processedData,
  ]);

  const pageIds = pageRows.map((item) => item.id);
  const allPageSelected = selection.isAllSelected(pageIds);
  const somePageSelected = selection.isSomeSelected(pageIds);

  const virtualization = useTableVirtualization({
    enabled: enableVirtualization && pageRows.length > 0 && !loading,
    count: pageRows.length,
    scrollElement,
    density,
    estimateSize: virtualRowHeight,
    overscan: virtualOverscan,
  });

  const bodyRows = virtualization.enabled
    ? virtualization.virtualRows.map((virtualRow) => ({
        virtualRow,
        ...pageRows[virtualRow.index]!,
        rowIndexOnPage: virtualRow.index,
      }))
    : pageRows.map((item, rowIndexOnPage) => ({
        virtualRow: null,
        ...item,
        rowIndexOnPage,
      }));

  const colSpan =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (sn ? 1 : 0) +
    (showActions ? 1 : 0);

  const firstStickyLeft = selectable ? "2.5rem" : "0";

  const tableMinWidth = React.useMemo(() => {
    if (minTableWidth) return minTableWidth;
    if (!resizable) return undefined;
    const dataWidth = visibleColumns.reduce(
      (sum, column) => sum + resize.getWidth(column.key, column),
      0,
    );
    const extras =
      (selectable ? 40 : 0) +
      (sn ? SN_COLUMN_WIDTH : 0) +
      (showActions ? actionsColumnWidth : 0);
    return `${dataWidth + extras}px`;
  }, [
    actionsColumnWidth,
    minTableWidth,
    resizable,
    resize,
    selectable,
    showActions,
    sn,
    visibleColumns,
  ]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    emitState({ page: nextPage });
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPage(1);
    emitState({ page: 1, pageSize: nextSize });
  };

  const handleSort = (key: string) => {
    const resolved = cycleMultiSort(sort, key, {
      replace: !enableMultiSort,
    });

    if (!isSortControlled) setUncontrolledSort(resolved);
    onSortChange?.(resolved);
    setPage(1);
    emitState({ sort: resolved, page: 1 });
  };

  const handleFiltersChange = (next: DataTableFilters) => {
    if (!isFiltersControlled) setUncontrolledFilters(next);
    onFiltersChange?.(next);
    setPage(1);
    emitState({ filters: next, page: 1 });
  };

  const handleFilterBuilderApply = (payload: {
    conditions: FilterCondition[];
    params: URLSearchParams | null;
  }) => {
    const next = payload.params == null ? [] : payload.conditions;
    if (!isAdvancedFiltersControlled) setUncontrolledAdvancedFilters(next);
    onAdvancedFiltersChange?.(next);
    onFilterBuilderApply?.(payload);
    setPage(1);
    emitState({ advancedFilters: next, page: 1 });
  };

  const filterBuilderColumns = React.useMemo(
    () => toFilterBuilderColumns(columns),
    [columns],
  );

  const appliedAdvancedFilterCount = advancedFilters.filter((condition) => {
    const needsValue = !["boolean", "range", "color"].includes(
      filterBuilderColumns.find((column) => column.value === condition.column)
        ?.type ?? "string",
    );
    return needsValue ? condition.value.trim() !== "" : true;
  }).length;

  const handleDensityChange = (next: DataTableDensity) => {
    if (!isDensityControlled) setUncontrolledDensity(next);
    onDensityChange?.(next);
    emitState({ density: next });
  };

  const handleQuickFilterChange = (next: string) => {
    if (!isQuickFilterControlled) setUncontrolledQuickFilter(next);
    onQuickFilterChange?.(next);
    setPage(1);
    emitState({ quickFilter: next, page: 1 });
  };

  const handleVisibilityChange = (next: DataTableColumnVisibility) => {
    if (!isVisibilityControlled) setUncontrolledVisibility(next);
    onColumnVisibilityChange?.(next);
    emitState({ columnVisibility: next });
  };

  const handleOrderChange = (next: string[]) => {
    if (!isOrderControlled) setUncontrolledOrder(next);
    onColumnOrderChange?.(next);
    emitState({ columnOrder: next });
  };

  const handlePinnedChange = (next: DataTablePinnedColumns) => {
    if (!isPinnedControlled) setUncontrolledPinned(next);
    onPinnedColumnsChange?.(next);
    emitState({ pinnedColumns: next });
  };

  const handleHeaderSort = (key: string, direction: SortDirection | null) => {
    let resolved: DataTableSort[];
    if (direction == null) {
      resolved = sort.filter((item) => item.key !== key);
    } else if (enableMultiSort) {
      const without = sort.filter((item) => item.key !== key);
      resolved = [...without, { key, direction }];
    } else {
      resolved = [{ key, direction }];
    }
    if (!isSortControlled) setUncontrolledSort(resolved);
    onSortChange?.(resolved);
    setPage(1);
    emitState({ sort: resolved, page: 1 });
  };

  const handlePinColumn = (key: string, side: "left" | "right" | null) => {
    const left = (pinnedColumns.left ?? []).filter((item) => item !== key);
    const right = (pinnedColumns.right ?? []).filter((item) => item !== key);
    if (side === "left") left.push(key);
    if (side === "right") right.push(key);
    handlePinnedChange({ left, right });
  };

  const handleHideColumn = (key: string) => {
    handleVisibilityChange({ ...columnVisibility, [key]: false });
  };

  const handleDropReorder = (targetKey: string) => {
    if (!reorderable || !draggingKey || draggingKey === targetKey) return;
    const currentOrder =
      columnOrder.length > 0
        ? [...columnOrder]
        : columns.map((column) => column.key);
    const from = currentOrder.indexOf(draggingKey);
    const to = currentOrder.indexOf(targetKey);
    if (from < 0 || to < 0) return;
    currentOrder.splice(from, 1);
    currentOrder.splice(to, 0, draggingKey);
    handleOrderChange(currentOrder);
    setDraggingKey(null);
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      selection.selectAll(
        Array.from(new Set([...selection.selectedIds, ...pageIds])),
      );
      return;
    }
    selection.selectAll(
      selection.selectedIds.filter((id) => !pageIds.includes(id)),
    );
  };

  return (
    <div
      data-slot="data-table"
      data-density={density}
      data-radius={radius}
      data-mode={resolvedMode}
      data-sticky-header={stickyHeaderEnabled ? "true" : "false"}
      data-resizable={resizable ? "true" : "false"}
      style={style}
      className={cn(
        "w-full overflow-hidden bg-card text-card-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)] dark:ring-white/8",
        radiusClass,
        resize.isResizing && "select-none",
        classNames?.root,
        className,
      )}
    >
      {showToolbar ? (
        <div
          data-slot="data-table-toolbar"
          className={cn(
            "flex flex-wrap items-center gap-1.5 border-b border-black/[0.04] px-3 py-2 dark:border-white/[0.06]",
            classNames?.toolbar,
          )}
        >
          {enableQuickFilter ? (
            <QuickFilter
              value={quickFilter}
              onChange={handleQuickFilterChange}
              placeholder={quickFilterPlaceholder}
              radiusClass={radiusClass}
              className={classNames?.quickFilter}
            />
          ) : null}

          <div className="min-w-0 flex-1">{toolbar}</div>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {showFilterBuilder ? (
              <FilterBuilderMenu
                columns={filterBuilderColumns}
                applied={advancedFilters}
                onApply={handleFilterBuilderApply}
                onClear={() =>
                  handleFilterBuilderApply({ conditions: [], params: null })
                }
                activeCount={appliedAdvancedFilterCount}
                radiusClass={radiusClass}
                className={classNames?.filterBuilder}
              />
            ) : null}
            {showColumnSelector ? (
              <ColumnVisibilityMenu
                columns={columns}
                visibility={columnVisibility}
                onVisibilityChange={handleVisibilityChange}
                radiusClass={radiusClass}
                className={classNames?.columnSelector}
              />
            ) : null}
            {showDensityControl ? (
              <DensityControl
                value={density}
                onChange={handleDensityChange}
                radiusClass={radiusClass}
                className={classNames?.densityControl}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {showFilterBar ? (
        <FilterBar
          columns={visibleColumns}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className={classNames?.filterBar}
          radiusClass={radiusClass}
        />
      ) : null}

      <div
        ref={setScrollElement}
        data-slot="data-table-scroll"
        data-virtualized={virtualization.enabled ? "true" : "false"}
        className="data-table-thin-scroll relative w-full overflow-auto overscroll-x-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15 dark:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent"
        style={resolvedMaxHeight ? { maxHeight: resolvedMaxHeight } : undefined}
      >
        {loading ? (
          <div
            data-slot="data-table-loading"
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="text-sm text-muted-foreground">Loading…</span>
          </div>
        ) : null}

        <Table
          className={cn(
            "min-w-full",
            (resizable ||
              visibleColumns.some((c) => c.width || c.maxWidth)) &&
              "table-fixed",
            classNames?.table,
          )}
          style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}
        >
          {resizable ||
          visibleColumns.some((c) => c.width || c.minWidth) ||
          sn ? (
            <colgroup>
              {selectable ? <col style={{ width: 40 }} /> : null}
              {sn ? (
                <col
                  style={{
                    width: SN_COLUMN_WIDTH,
                    minWidth: SN_COLUMN_WIDTH,
                    maxWidth: SN_COLUMN_WIDTH,
                  }}
                />
              ) : null}
              {visibleColumns.map((column) => {
                const width = resizable
                  ? resize.getWidth(column.key, column)
                  : column.width;
                return (
                  <col
                    key={column.key}
                    style={{
                      width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                    }}
                  />
                );
              })}
              {showActions ? (
                <col style={{ width: actionsColumnWidth }} />
              ) : null}
            </colgroup>
          ) : null}

          <TableHeader
            className={cn(
              stickyHeaderEnabled &&
                "sticky top-0 z-20 bg-card shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]",
              classNames?.header,
            )}
          >
            <TableRow
              data-state="header"
              className={cn("hover:bg-transparent", classNames?.headerRow)}
            >
              {selectable ? (
                <TableHead
                  className={cn(
                    "w-10 bg-card",
                    densityHeader,
                    cellBorderClass,
                    (stickyFirstColumn || leftPinnedKeys.length > 0) &&
                      "sticky left-0 z-40",
                    classNames?.headerCell,
                  )}
                >
                  <Checkbox
                    checked={
                      allPageSelected
                        ? true
                        : somePageSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows on this page"
                  />
                </TableHead>
              ) : null}

              {sn ? (
                <SnHeader
                  label={snHeader}
                  className={cn(
                    cellBorderClass,
                    (stickyFirstColumn || leftPinnedKeys.length > 0) &&
                      "sticky z-40",
                    classNames?.headerCell,
                  )}
                  style={
                    stickyFirstColumn || leftPinnedKeys.length > 0
                      ? { left: selectable ? 40 : 0 }
                      : undefined
                  }
                />
              ) : null}

              {visibleColumns.map((column, columnIndex) => {
                const sortIndex = sort.findIndex(
                  (item) => item.key === column.key,
                );
                const sortRule = sortIndex >= 0 ? sort[sortIndex] : undefined;
                const pinnedSide = resolvePinnedSide(
                  column.key,
                  pinnedColumns,
                  column.pinned ?? (column.sticky ? "left" : undefined),
                );
                const isSticky =
                  pinnedSide === "left" ||
                  pinnedSide === "right" ||
                  (stickyFirstColumn && columnIndex === 0);
                const canResize =
                  resizable && column.resizable !== false;
                const resizedWidth = resizable
                  ? resize.getWidth(column.key, column)
                  : undefined;
                const sizeStyle = getColumnSizeStyle(column, resizedWidth);
                const truncate = shouldTruncateColumn(column);
                const isLastLeftPin =
                  pinnedSide === "left" &&
                  leftPinnedKeys[leftPinnedKeys.length - 1] === column.key;
                const isFirstRightPin =
                  pinnedSide === "right" &&
                  rightPinnedKeys[0] === column.key;
                const pinnedLeft =
                  pinnedSide === "left"
                    ? getPinnedLeftOffset(column.key)
                    : stickyFirstColumn && columnIndex === 0
                      ? firstStickyLeft
                      : undefined;
                const pinnedRight =
                  pinnedSide === "right"
                    ? getPinnedRightOffset(column.key)
                    : undefined;

                return (
                  <TableHead
                    key={column.key}
                    draggable={reorderable}
                    onDragStart={() => setDraggingKey(column.key)}
                    onDragOver={(event) => {
                      if (!reorderable) return;
                      event.preventDefault();
                    }}
                    onDrop={() => handleDropReorder(column.key)}
                    onDragEnd={() => setDraggingKey(null)}
                    className={cn(
                      "relative overflow-hidden bg-card",
                      densityHeader,
                      cellBorderClass,
                      column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                      isSticky && "sticky z-30",
                      isLastLeftPin &&
                        "shadow-[1px_0_0_0_rgba(0,0,0,0.08)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.1)]",
                      isFirstRightPin &&
                        "shadow-[-1px_0_0_0_rgba(0,0,0,0.08)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.1)]",
                      draggingKey === column.key && "opacity-50",
                      reorderable && "cursor-grab active:cursor-grabbing",
                      column.headerClassName,
                      classNames?.headerCell,
                    )}
                    style={{
                      ...sizeStyle,
                      ...(pinnedLeft != null ? { left: pinnedLeft } : null),
                      ...(pinnedRight != null ? { right: pinnedRight } : null),
                    }}
                    aria-sort={
                      column.sortable
                        ? sortRule?.direction === "asc"
                          ? "ascending"
                          : sortRule?.direction === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    <div
                      className={cn(
                        "flex min-w-0 items-center gap-1",
                        canResize && "pr-2",
                      )}
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          className="inline-flex min-w-0 max-w-full items-center gap-1.5 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          onClick={() => handleSort(column.key)}
                          aria-label={`Sort by ${column.header}`}
                          title={column.header}
                        >
                          <CellContent truncate={truncate} wrap={column.wrap}>
                            {column.header}
                          </CellContent>
                          {sortRule?.direction === "asc" ? (
                            <ArrowUpIcon
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : sortRule?.direction === "desc" ? (
                            <ArrowDownIcon
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowUpDownIcon
                              className="size-3.5 shrink-0 opacity-40"
                              aria-hidden="true"
                            />
                          )}
                          {sortIndex >= 0 && sort.length > 1 ? (
                            <span
                              className="inline-flex size-4 shrink-0 items-center justify-center bg-muted text-[10px] font-semibold text-muted-foreground"
                              aria-label={`Sort priority ${sortIndex + 1}`}
                            >
                              {sortIndex + 1}
                            </span>
                          ) : null}
                        </button>
                      ) : (
                        <CellContent
                          truncate={truncate}
                          wrap={column.wrap}
                          title={column.header}
                        >
                          {column.header}
                        </CellContent>
                      )}

                      {showColumnMenu ? (
                        <ColumnHeaderMenu
                          columnKey={column.key}
                          header={column.header}
                          sortable={column.sortable}
                          sortRule={sortRule}
                          pinned={pinnedSide}
                          radiusClass={radiusClass}
                          onSort={(direction) =>
                            handleHeaderSort(column.key, direction)
                          }
                          onHide={() => handleHideColumn(column.key)}
                          onPin={(side) => handlePinColumn(column.key, side)}
                        />
                      ) : null}
                    </div>

                    {canResize ? (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${column.header} column`}
                        tabIndex={0}
                        className="group/resize absolute top-0 right-0 z-40 flex h-full w-2.5 cursor-col-resize touch-none select-none items-center justify-center"
                        onMouseDown={(event) =>
                          resize.beginResize(column.key, event, {
                            minWidth: column.minWidth,
                            maxWidth: column.maxWidth,
                          })
                        }
                        onTouchStart={(event) =>
                          resize.beginResize(column.key, event, {
                            minWidth: column.minWidth,
                            maxWidth: column.maxWidth,
                          })
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key !== "ArrowLeft" &&
                            event.key !== "ArrowRight"
                          ) {
                            return;
                          }
                          event.preventDefault();
                          const delta = event.key === "ArrowRight" ? 8 : -8;
                          const current = resize.getWidth(column.key, column);
                          resize.setWidth(column.key, current + delta, {
                            minWidth: column.minWidth,
                            maxWidth: column.maxWidth,
                          });
                        }}
                        onDoubleClick={(event) => {
                          event.stopPropagation();
                          resize.setWidth(
                            column.key,
                            column.width ?? column.minWidth ?? 160,
                            {
                              minWidth: column.minWidth,
                              maxWidth: column.maxWidth,
                            },
                          );
                        }}
                      >
                        <span className="h-3.5 w-px bg-transparent group-hover/resize:bg-foreground/20 group-focus-visible/resize:bg-foreground/30" />
                      </div>
                    ) : null}
                  </TableHead>
                );
              })}

              {showActions ? (
                <TableHead
                  className={cn(
                    "bg-card",
                    densityHeader,
                    cellBorderClass,
                    actionsSticky &&
                      "sticky right-0 z-30 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.08)]",
                    classNames?.headerCell,
                  )}
                  style={{
                    width: actionsColumnWidth,
                    minWidth: actionsColumnWidth,
                  }}
                >
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>

          <TableBody className={classNames?.body}>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={colSpan}
                  className={cn(
                    "h-28 text-center text-muted-foreground",
                    densityCell,
                    classNames?.cell,
                  )}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {virtualization.enabled && virtualization.paddingTop > 0 ? (
                  <tr aria-hidden="true">
                    <td
                      colSpan={colSpan}
                      style={{
                        height: virtualization.paddingTop,
                        padding: 0,
                        border: 0,
                      }}
                    />
                  </tr>
                ) : null}

                {bodyRows.map(({ row, index, id, rowIndexOnPage }) => {
                const isSelected = selection.isSelected(id);
                const isActive = activeRowId === id;
                const resolvedRowClassName =
                  typeof rowClassName === "function"
                    ? rowClassName(row, index)
                    : rowClassName;

                return (
                  <TableRow
                    key={id}
                    data-index={rowIndexOnPage}
                    data-state={
                      isSelected ? "selected" : isActive ? "active" : undefined
                    }
                    className={cn(
                      onRowClick && "cursor-pointer",
                      classNames?.row,
                      resolvedRowClassName,
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable ? (
                      <TableCell
                        className={cn(
                          "bg-card",
                          densityCell,
                          cellBorderClass,
                          (stickyFirstColumn || leftPinnedKeys.length > 0) &&
                            "sticky left-0 z-20",
                          isSelected && "bg-muted/40",
                          classNames?.cell,
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => selection.toggle(id)}
                          aria-label={`Select row ${id}`}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </TableCell>
                    ) : null}

                    {sn ? (
                      <SnCell
                        value={getSerialNumber(page, pageSize, rowIndexOnPage)}
                        className={cn(
                          cellBorderClass,
                          (stickyFirstColumn || leftPinnedKeys.length > 0) &&
                            "sticky z-20",
                          isSelected && "bg-muted/40",
                          classNames?.cell,
                        )}
                        style={
                          stickyFirstColumn || leftPinnedKeys.length > 0
                            ? { left: selectable ? 40 : 0 }
                            : undefined
                        }
                      />
                    ) : null}

                    {visibleColumns.map((column, columnIndex) => {
                      const rawValue = getCellValue(row, column.key);
                      const textValue =
                        rawValue == null ? "" : String(rawValue);
                      const content = column.cell
                        ? column.cell(row, index)
                        : textValue;
                      const pinnedSide = resolvePinnedSide(
                        column.key,
                        pinnedColumns,
                        column.pinned ?? (column.sticky ? "left" : undefined),
                      );
                      const isSticky =
                        pinnedSide === "left" ||
                        pinnedSide === "right" ||
                        (stickyFirstColumn && columnIndex === 0);
                      const resizedWidth = resizable
                        ? resize.getWidth(column.key, column)
                        : undefined;
                      const sizeStyle = getColumnSizeStyle(
                        column,
                        resizedWidth,
                      );
                      const truncate = shouldTruncateColumn(column);
                      const isLastLeftPin =
                        pinnedSide === "left" &&
                        leftPinnedKeys[leftPinnedKeys.length - 1] ===
                          column.key;
                      const isFirstRightPin =
                        pinnedSide === "right" &&
                        rightPinnedKeys[0] === column.key;
                      const pinnedLeft =
                        pinnedSide === "left"
                          ? getPinnedLeftOffset(column.key)
                          : stickyFirstColumn && columnIndex === 0
                            ? firstStickyLeft
                            : undefined;
                      const pinnedRight =
                        pinnedSide === "right"
                          ? getPinnedRightOffset(column.key)
                          : undefined;
                      const canEdit = isColumnEditable(column);
                      const cellEditing = editing.isEditingCell(
                        id,
                        column.key,
                      );
                      const editValue =
                        editing.draft[column.key] !== undefined
                          ? editing.draft[column.key]
                          : rawValue;

                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            "overflow-hidden bg-card",
                            densityCell,
                            cellBorderClass,
                            column.hideBelow &&
                              HIDE_BELOW_CLASS[column.hideBelow],
                            isSticky && "sticky z-10",
                            isLastLeftPin &&
                              "shadow-[1px_0_0_0_rgba(0,0,0,0.08)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.1)]",
                            isFirstRightPin &&
                              "shadow-[-1px_0_0_0_rgba(0,0,0,0.08)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.1)]",
                            isSelected && "bg-muted/40",
                            canEdit && "cursor-text",
                            cellEditing && "bg-muted/30",
                            column.className,
                            classNames?.cell,
                          )}
                          style={{
                            ...sizeStyle,
                            ...(pinnedLeft != null
                              ? { left: pinnedLeft }
                              : null),
                            ...(pinnedRight != null
                              ? { right: pinnedRight }
                              : null),
                          }}
                          onDoubleClick={(event) => {
                            if (!canEdit) return;
                            event.stopPropagation();
                            const params = {
                              id,
                              field: column.key,
                              row,
                              value: rawValue,
                            };
                            if (editMode === "row") {
                              editing.startRowEdit(params);
                            } else {
                              editing.startCellEdit(params);
                            }
                          }}
                        >
                          {cellEditing ? (
                            <EditableCell
                              value={editValue}
                              editType={column.editType}
                              editOptions={column.editOptions}
                              radiusClass={radiusClass}
                              aria-label={`Edit ${column.header}`}
                              onChange={(next) =>
                                editing.setDraftValue(column.key, next)
                              }
                              onCommit={(reason) => {
                                if (editMode === "row") return;
                                void editing.commitCellEdit(reason);
                              }}
                              onCancel={() => editing.cancelEdit("escape")}
                              renderEditCell={
                                column.renderEditCell
                                  ? (helpers) =>
                                      column.renderEditCell!({
                                        ...helpers,
                                        row,
                                        field: column.key,
                                      })
                                  : undefined
                              }
                            />
                          ) : (
                            <CellContent
                              wrap={column.wrap}
                              truncate={truncate}
                              title={
                                truncate && !column.cell
                                  ? textValue
                                  : undefined
                              }
                            >
                              {content}
                            </CellContent>
                          )}
                        </TableCell>
                      );
                    })}

                    {showActions ? (
                      <TableCell
                        className={cn(
                          "bg-card",
                          densityCell,
                          cellBorderClass,
                          actionsSticky &&
                            "sticky right-0 z-20 shadow-[-1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[-1px_0_0_0_rgba(255,255,255,0.08)]",
                          isSelected && "bg-muted/40",
                          classNames?.cell,
                        )}
                        style={{
                          width: Math.max(
                            actionsColumnWidth,
                            showRowEditControls && editing.isEditingRow(id)
                              ? 88
                              : actionsColumnWidth,
                          ),
                          minWidth: Math.max(
                            actionsColumnWidth,
                            showRowEditControls && editing.isEditingRow(id)
                              ? 88
                              : actionsColumnWidth,
                          ),
                        }}
                      >
                        <div className="flex items-center justify-end gap-0.5">
                          {showRowEditControls && editing.isEditingRow(id) ? (
                            <>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant="ghost"
                                aria-label="Save row"
                                className={cn(
                                  "text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700",
                                  radiusClass,
                                )}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void editing.commitRowEdit();
                                }}
                              >
                                <CheckIcon className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant="ghost"
                                aria-label="Cancel edit"
                                className={cn(
                                  "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                                  radiusClass,
                                )}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  editing.cancelEdit("rowCancel");
                                }}
                              >
                                <XIcon className="size-3.5" />
                              </Button>
                            </>
                          ) : null}

                          {actions ? (
                            <RowActions
                              row={row}
                              actions={resolveRowActions(actions, row, {
                                permissions: actionsOptions?.permissions,
                                canAccess: actionsOptions?.canAccess,
                              })}
                              display={resolvedActionsDisplay}
                              placement={popoverPlacement}
                              offsetDistance={popoverOffset}
                              radiusClass={radiusClass}
                              menuAriaLabel={
                                actionsOptions?.menuAriaLabel ??
                                `Actions for row ${id}`
                              }
                            />
                          ) : renderRowActions ? (
                            <RowActions
                              row={row}
                              actions={[]}
                              display="menu"
                              placement={popoverPlacement}
                              offsetDistance={popoverOffset}
                              radiusClass={radiusClass}
                              menuAriaLabel={`Actions for row ${id}`}
                            >
                              {renderRowActions(row)}
                            </RowActions>
                          ) : null}
                        </div>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}

                {virtualization.enabled && virtualization.paddingBottom > 0 ? (
                  <tr aria-hidden="true">
                    <td
                      colSpan={colSpan}
                      style={{
                        height: virtualization.paddingBottom,
                        padding: 0,
                        border: 0,
                      }}
                    />
                  </tr>
                ) : null}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <TablePagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={resolvedPageSizeOptions}
          options={paginationOptions}
          className={classNames?.pagination}
          radiusClass={radiusClass}
        />
      ) : null}
    </div>
  );
}
