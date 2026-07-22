"use client";

import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { CellContent } from "./cell-content";
import { ColumnHeaderMenu } from "./column-header-menu";
import { ColumnVisibilityMenu } from "./column-visibility-menu";
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
import { DETAIL_EXPAND_COLUMN_WIDTH, DetailExpandButton } from "./detail-panel";
import { EditableCell } from "./editable-cell";
import { ExportMenu } from "./export-menu";
import { rowsToCsvMatrix } from "./export-utils";
import { FilterBar } from "./filter-bar";
import { FilterBuilderMenu } from "./filter-builder";
import {
  matchesFilterConditions,
  toFilterBuilderColumns,
} from "./filter-builder/types";
import { cn } from "./lib/utils";
import { DataTableLocaleProvider, resolveLocaleText } from "./locale-text";
import { QuickFilter } from "./quick-filter";
import { RowActions } from "./row-actions";
import {
  getSerialNumber,
  SN_COLUMN_WIDTH,
  SnCell,
  SnHeader,
} from "./sn-column";
import { TablePagination } from "./table-pagination";
import {
  buildTreeFromPaths,
  flattenVisibleTree,
  getDefaultExpandedGroupIds,
  isSelectableTreeRow,
  type TreeFlatRow,
} from "./tree-data";
import {
  applyPinOrder,
  cycleMultiSort,
  type DataTableColumn,
  type DataTableColumnVisibility,
  type DataTableDensity,
  type DataTableFilters,
  type DataTablePinnedColumns,
  type DataTableProps,
  type DataTableSort,
  type DataTableState,
  DENSITY_CELL_CLASS,
  DENSITY_HEADER_CLASS,
  type FilterCondition,
  getColumnSizeStyle,
  getVisibleColumns,
  HIDE_BELOW_CLASS,
  isColumnVisible,
  mergePageSizeOptions,
  normalizeSort,
  orderColumns,
  RADIUS_CLASS,
  resolvePinnedSide,
  resolveRowActions,
  type SortDirection,
  shouldTruncateColumn,
} from "./types";
import { useColumnResize } from "./use-column-resize";
import { useTableEditing } from "./use-table-editing";
import { useTableKeyboard } from "./use-table-keyboard";
import { useTableSelection } from "./use-table-selection";
import { useTableVirtualization } from "./use-table-virtualization";

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
  DataTableStyles,
  FilterCondition,
  SortDirection,
} from "./types";

export {
  applyPinOrder,
  cycleMultiSort,
  DENSITY_OPTIONS,
  getColumnSizeStyle,
  getVisibleColumns,
  hasActionPermission,
  isColumnVisible,
  isRowActionDisabled,
  isRowActionVisible,
  mergePageSizeOptions,
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
    const query = String(raw ?? "")
      .trim()
      .toLowerCase();
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
  snHeader,
  stickyHeader = false,
  stickyHeading = false,
  stickyFirstColumn = false,
  minTableWidth,
  maxHeight,
  emptyMessage,
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
  quickFilterPlaceholder,
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
  styles,
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
  showExport = false,
  exportFilename = "table-export.csv",
  exportScope = "filtered",
  onExported,
  enableKeyboardNavigation = false,
  getDetailPanelContent,
  detailPanelExpandedRowIds: controlledDetailExpanded,
  defaultDetailPanelExpandedRowIds = [],
  onDetailPanelExpandedRowIdsChange,
  treeData = false,
  getTreeDataPath,
  expandedTreeIds: controlledTreeExpanded,
  defaultExpandedTreeIds,
  onExpandedTreeIdsChange,
  defaultGroupingExpansionDepth = 1,
  groupingColDef,
  localeText: localeTextProp,
  toolbar,
}: DataTableProps<T>) {
  const locale = React.useMemo(
    () => resolveLocaleText(localeTextProp),
    [localeTextProp],
  );
  const resolvedEmptyMessage = emptyMessage ?? locale.emptyMessage;
  const resolvedSnHeader = snHeader ?? locale.snHeader;
  const resolvedQuickFilterPlaceholder =
    quickFilterPlaceholder ?? locale.quickFilterPlaceholder;
  const showDetailExpand = typeof getDetailPanelContent === "function";
  const treeEnabled = treeData && typeof getTreeDataPath === "function";
  const virtualizationAllowed =
    enableVirtualization && !showDetailExpand && !treeEnabled;

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
  const actionsColumnWidth = !showActions
    ? 0
    : typeof renderRowActions === "function" && actions == null
      ? 40
      : resolvedActionsDisplay === "icons"
        ? 108
        : 40;
  const stickyHeaderEnabled = stickyHeader || stickyHeading;
  const resolvedMaxHeight =
    maxHeight ??
    (stickyHeaderEnabled || virtualizationAllowed ? "28rem" : undefined);
  const showFilterBar =
    enableFiltering && columns.some((column) => column.filterable);
  const showToolbar =
    showDensityControl ||
    showColumnSelector ||
    enableQuickFilter ||
    showFilterBuilder ||
    showExport ||
    toolbar != null;

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pageSizeProp);
  const resolvedPageSizeOptions = React.useMemo(
    () =>
      mergePageSizeOptions(
        paginationOptions?.pageSizeOptions ?? pageSizeOptions,
        pageSize,
      ),
    [pageSize, pageSizeOptions, paginationOptions?.pageSizeOptions],
  );
  const [uncontrolledSort, setUncontrolledSort] = React.useState<
    DataTableSort[]
  >(normalizeSort(defaultSort));
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
  const [uncontrolledDetailExpanded, setUncontrolledDetailExpanded] =
    React.useState<string[]>(defaultDetailPanelExpandedRowIds);
  const [uncontrolledTreeExpanded, setUncontrolledTreeExpanded] =
    React.useState<string[]>(defaultExpandedTreeIds ?? []);
  const [treeExpandSeeded, setTreeExpandSeeded] = React.useState(
    () => defaultExpandedTreeIds != null,
  );
  const [draggingKey, setDraggingKey] = React.useState<string | null>(null);
  const [scrollElement, setScrollElement] =
    React.useState<HTMLDivElement | null>(null);

  const isSortControlled = controlledSort !== undefined;
  const isFiltersControlled = controlledFilters !== undefined;
  const isAdvancedFiltersControlled = controlledAdvancedFilters !== undefined;
  const isDensityControlled = controlledDensity !== undefined;
  const isQuickFilterControlled = controlledQuickFilter !== undefined;
  const isVisibilityControlled = controlledVisibility !== undefined;
  const isOrderControlled = controlledOrder !== undefined;
  const isPinnedControlled = controlledPinned !== undefined;
  const isDetailExpandedControlled = controlledDetailExpanded !== undefined;
  const isTreeExpandedControlled = controlledTreeExpanded !== undefined;

  const sort = isSortControlled
    ? normalizeSort(controlledSort)
    : uncontrolledSort;
  const filters = isFiltersControlled ? controlledFilters : uncontrolledFilters;
  const advancedFilters = isAdvancedFiltersControlled
    ? controlledAdvancedFilters
    : uncontrolledAdvancedFilters;
  const density = isDensityControlled ? controlledDensity : uncontrolledDensity;
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
  const detailExpandedIds = isDetailExpandedControlled
    ? controlledDetailExpanded
    : uncontrolledDetailExpanded;
  const expandedTreeIdList = isTreeExpandedControlled
    ? controlledTreeExpanded
    : uncontrolledTreeExpanded;
  const expandedTreeIdSet = React.useMemo(
    () => new Set(expandedTreeIdList),
    [expandedTreeIdList],
  );
  const detailExpandedSet = React.useMemo(
    () => new Set(detailExpandedIds),
    [detailExpandedIds],
  );

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
      left += showDetailExpand ? DETAIL_EXPAND_COLUMN_WIDTH : 0;
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
      showDetailExpand,
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

  const totalItemsBase = isServer
    ? (totalRows ?? data.length)
    : processedData.length;

  const treeRoot = React.useMemo(() => {
    if (!treeEnabled || !getTreeDataPath) return null;
    const source = isServer ? data : processedData;
    return buildTreeFromPaths({
      rows: source,
      getTreeDataPath,
      getRowId,
    });
  }, [data, getRowId, getTreeDataPath, isServer, processedData, treeEnabled]);

  React.useEffect(() => {
    if (
      !treeEnabled ||
      !treeRoot ||
      treeExpandSeeded ||
      isTreeExpandedControlled
    ) {
      return;
    }
    setUncontrolledTreeExpanded(
      getDefaultExpandedGroupIds(treeRoot, defaultGroupingExpansionDepth),
    );
    setTreeExpandSeeded(true);
  }, [
    defaultGroupingExpansionDepth,
    isTreeExpandedControlled,
    treeEnabled,
    treeExpandSeeded,
    treeRoot,
  ]);

  const flattenedTreeRows = React.useMemo(() => {
    if (!treeRoot) return null;
    return flattenVisibleTree(treeRoot, { expandedIds: expandedTreeIdSet });
  }, [expandedTreeIdSet, treeRoot]);

  const totalItems =
    treeEnabled && flattenedTreeRows
      ? isServer
        ? (totalRows ?? flattenedTreeRows.length)
        : flattenedTreeRows.length
      : totalItemsBase;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageRows = React.useMemo((): Array<{
    row: T;
    index: number;
    id: string;
    tree?: TreeFlatRow<T>;
  }> => {
    type PageRow = {
      row: T;
      index: number;
      id: string;
      tree?: TreeFlatRow<T>;
    };

    if (treeEnabled && flattenedTreeRows) {
      const start = isServer ? 0 : (page - 1) * pageSize;
      const slice = isServer
        ? flattenedTreeRows
        : flattenedTreeRows.slice(start, start + pageSize);

      return slice.map((treeRow, indexOnPage): PageRow => {
        const absoluteIndex = start + indexOnPage;
        if (treeRow.kind === "leaf" && treeRow.row != null) {
          const id = treeRow.id;
          return {
            row: editing.getDisplayRow(treeRow.row, id),
            index: absoluteIndex,
            id,
            tree: treeRow,
          };
        }
        return {
          row: treeRow.row ?? ({} as T),
          index: absoluteIndex,
          id: treeRow.id,
          tree: treeRow,
        };
      });
    }

    if (isServer) {
      return data.map((row, index): PageRow => {
        const id = getRowId(row, index);
        return {
          row: editing.getDisplayRow(row, id),
          index,
          id,
        };
      });
    }

    const start = (page - 1) * pageSize;
    return processedData
      .slice(start, start + pageSize)
      .map((row, index): PageRow => {
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
    flattenedTreeRows,
    getRowId,
    isServer,
    page,
    pageSize,
    processedData,
    treeEnabled,
  ]);

  const pageIds = pageRows
    .filter((item) => !item.tree || isSelectableTreeRow(item.tree))
    .map((item) => item.id);
  const allPageSelected = selection.isAllSelected(pageIds);
  const somePageSelected = selection.isSomeSelected(pageIds);

  const virtualization = useTableVirtualization({
    enabled: virtualizationAllowed && pageRows.length > 0 && !loading,
    count: pageRows.length,
    scrollElement,
    density,
    estimateSize: virtualRowHeight,
    overscan: virtualOverscan,
  });

  const setDetailExpanded = React.useCallback(
    (ids: string[]) => {
      if (!isDetailExpandedControlled) setUncontrolledDetailExpanded(ids);
      onDetailPanelExpandedRowIdsChange?.(ids);
    },
    [isDetailExpandedControlled, onDetailPanelExpandedRowIdsChange],
  );

  const toggleDetailExpanded = React.useCallback(
    (id: string) => {
      const next = detailExpandedSet.has(id)
        ? detailExpandedIds.filter((item) => item !== id)
        : [...detailExpandedIds, id];
      setDetailExpanded(next);
    },
    [detailExpandedIds, detailExpandedSet, setDetailExpanded],
  );

  const setTreeExpanded = React.useCallback(
    (ids: string[]) => {
      if (!isTreeExpandedControlled) setUncontrolledTreeExpanded(ids);
      onExpandedTreeIdsChange?.(ids);
    },
    [isTreeExpandedControlled, onExpandedTreeIdsChange],
  );

  const toggleTreeExpanded = React.useCallback(
    (id: string) => {
      const next = expandedTreeIdSet.has(id)
        ? expandedTreeIdList.filter((item) => item !== id)
        : [...expandedTreeIdList, id];
      setTreeExpanded(next);
    },
    [expandedTreeIdList, expandedTreeIdSet, setTreeExpanded],
  );

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

  const keyboard = useTableKeyboard({
    enabled: enableKeyboardNavigation && pageRows.length > 0,
    rowCount: pageRows.length,
    colCount: visibleColumns.length,
    editable,
    isEditing: editing.editingCell != null || editing.editingRowId != null,
    onStartEdit: ({ rowIndex, colIndex }) => {
      const item = pageRows[rowIndex];
      const column = visibleColumns[colIndex];
      if (!item || !column || item.tree?.kind === "group") return;
      if (!isColumnEditable(column)) return;
      const value = getCellValue(item.row, column.key);
      const params = {
        id: item.id,
        field: column.key,
        row: item.row,
        value,
      };
      if (editMode === "row") editing.startRowEdit(params);
      else editing.startCellEdit(params);
    },
  });

  const getExportCsv = React.useCallback(() => {
    const exportColumns = visibleColumns.map((column) => ({
      key: column.key,
      header: column.header,
    }));

    let exportRows: T[] = [];
    if (exportScope === "page") {
      exportRows = pageRows
        .filter((item) => !item.tree || isSelectableTreeRow(item.tree))
        .map((item) => item.row);
    } else if (exportScope === "selected") {
      const selected = new Set(selection.selectedIds);
      const source = isServer ? data : processedData;
      exportRows = source
        .map((row, index) => ({
          row: editing.getDisplayRow(row, getRowId(row, index)),
          id: getRowId(row, index),
        }))
        .filter((item) => selected.has(item.id))
        .map((item) => item.row);
    } else {
      const source = isServer ? data : processedData;
      exportRows = source.map((row, index) =>
        editing.getDisplayRow(row, getRowId(row, index)),
      );
    }

    return rowsToCsvMatrix({
      columns: exportColumns,
      rows: exportRows,
      getValue: getCellValue,
    });
  }, [
    data,
    editing,
    exportScope,
    getRowId,
    isServer,
    pageRows,
    processedData,
    selection.selectedIds,
    visibleColumns,
  ]);

  const colSpan =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (showDetailExpand ? 1 : 0) +
    (sn ? 1 : 0) +
    (showActions ? 1 : 0);

  const firstStickyLeft = selectable
    ? showDetailExpand
      ? `${40 + DETAIL_EXPAND_COLUMN_WIDTH}px`
      : "2.5rem"
    : showDetailExpand
      ? `${DETAIL_EXPAND_COLUMN_WIDTH}px`
      : "0";

  const tableMinWidth = React.useMemo(() => {
    if (minTableWidth) return minTableWidth;
    if (!resizable) return undefined;
    const dataWidth = visibleColumns.reduce(
      (sum, column) => sum + resize.getWidth(column.key, column),
      0,
    );
    const extras =
      (selectable ? 40 : 0) +
      (showDetailExpand ? DETAIL_EXPAND_COLUMN_WIDTH : 0) +
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
    showDetailExpand,
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
    <DataTableLocaleProvider value={locale}>
      <div
        data-slot="data-table"
        data-density={density}
        data-radius={radius}
        data-mode={resolvedMode}
        data-sticky-header={stickyHeaderEnabled ? "true" : "false"}
        data-resizable={resizable ? "true" : "false"}
        data-tree={treeEnabled ? "true" : "false"}
        data-detail-panel={showDetailExpand ? "true" : "false"}
        style={{ ...styles?.root, ...style }}
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
            style={styles?.toolbar}
          >
            {enableQuickFilter ? (
              <QuickFilter
                value={quickFilter}
                onChange={handleQuickFilterChange}
                placeholder={resolvedQuickFilterPlaceholder}
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
              {showExport ? (
                <ExportMenu
                  getCsv={getExportCsv}
                  filename={exportFilename}
                  radiusClass={radiusClass}
                  className={classNames?.export}
                  onExported={onExported}
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
            style={styles?.filterBar}
          />
        ) : null}

        <div
          ref={setScrollElement}
          data-slot="data-table-scroll"
          data-virtualized={virtualization.enabled ? "true" : "false"}
          className={cn(
            "data-table-thin-scroll relative w-full overflow-auto overscroll-x-contain [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15 dark:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent",
            classNames?.scroll,
          )}
          style={{
            ...(resolvedMaxHeight ? { maxHeight: resolvedMaxHeight } : null),
            ...styles?.scroll,
          }}
        >
          {loading ? (
            <div
              data-slot="data-table-loading"
              className={cn(
                "absolute inset-0 z-30 flex items-center justify-center bg-background/60 backdrop-blur-[1px]",
                classNames?.loading,
              )}
              style={styles?.loading}
              aria-live="polite"
              aria-busy="true"
            >
              <span className="text-sm text-muted-foreground">
                {locale.loading}
              </span>
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
            style={{
              ...(tableMinWidth ? { minWidth: tableMinWidth } : null),
              ...styles?.table,
            }}
          >
            {resizable ||
            visibleColumns.some((c) => c.width || c.minWidth) ||
            sn ||
            showDetailExpand ? (
              <colgroup>
                {selectable ? <col style={{ width: 40 }} /> : null}
                {showDetailExpand ? (
                  <col style={{ width: DETAIL_EXPAND_COLUMN_WIDTH }} />
                ) : null}
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
                    : column.key === visibleColumns[0]?.key &&
                        groupingColDef?.width != null
                      ? groupingColDef.width
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
              style={styles?.header}
            >
              <TableRow
                data-state="header"
                className={cn("hover:bg-transparent", classNames?.headerRow)}
                style={styles?.headerRow}
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
                      aria-label={locale.selectAllAria}
                    />
                  </TableHead>
                ) : null}

                {showDetailExpand ? (
                  <TableHead
                    className={cn(
                      "w-9 bg-card",
                      densityHeader,
                      cellBorderClass,
                      classNames?.headerCell,
                    )}
                    style={{ width: DETAIL_EXPAND_COLUMN_WIDTH }}
                  >
                    <span className="sr-only">{locale.detailPanelAria}</span>
                  </TableHead>
                ) : null}

                {sn ? (
                  <SnHeader
                    label={resolvedSnHeader}
                    className={cn(
                      cellBorderClass,
                      (stickyFirstColumn || leftPinnedKeys.length > 0) &&
                        "sticky z-40",
                      classNames?.headerCell,
                    )}
                    style={
                      stickyFirstColumn || leftPinnedKeys.length > 0
                        ? {
                            left:
                              (selectable ? 40 : 0) +
                              (showDetailExpand
                                ? DETAIL_EXPAND_COLUMN_WIDTH
                                : 0),
                          }
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
                  const canResize = resizable && column.resizable !== false;
                  const resizedWidth = resizable
                    ? resize.getWidth(column.key, column)
                    : undefined;
                  const sizeStyle = getColumnSizeStyle(column, resizedWidth);
                  const truncate = shouldTruncateColumn(column);
                  const isLastLeftPin =
                    pinnedSide === "left" &&
                    leftPinnedKeys[leftPinnedKeys.length - 1] === column.key;
                  const isFirstRightPin =
                    pinnedSide === "right" && rightPinnedKeys[0] === column.key;
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
                        ...(pinnedRight != null
                          ? { right: pinnedRight }
                          : null),
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
                            aria-label={locale.sortByAria(
                              columnIndex === 0 && groupingColDef?.headerName
                                ? groupingColDef.headerName
                                : column.header,
                            )}
                            title={
                              columnIndex === 0 && groupingColDef?.headerName
                                ? groupingColDef.headerName
                                : column.header
                            }
                          >
                            <CellContent truncate={truncate} wrap={column.wrap}>
                              {columnIndex === 0 && groupingColDef?.headerName
                                ? groupingColDef.headerName
                                : column.header}
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
                                aria-label={locale.sortPriorityAria(
                                  sortIndex + 1,
                                )}
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
                          aria-label={locale.resizeColumnAria(column.header)}
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
                    <span className="sr-only">{locale.actionsHeader}</span>
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>

            <TableBody className={classNames?.body} style={styles?.body}>
              {pageRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={colSpan}
                    className={cn(
                      "h-28 text-center text-muted-foreground",
                      densityCell,
                      classNames?.cell,
                      classNames?.empty,
                    )}
                    style={{ ...styles?.cell, ...styles?.empty }}
                  >
                    {resolvedEmptyMessage}
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

                  {bodyRows.map(({ row, index, id, rowIndexOnPage, tree }) => {
                    const isGroup = tree?.kind === "group";
                    const canSelect = !tree || isSelectableTreeRow(tree);
                    const isSelected = canSelect && selection.isSelected(id);
                    const isActive = activeRowId === id;
                    const resolvedRowClassName =
                      typeof rowClassName === "function"
                        ? rowClassName(row, index)
                        : rowClassName;
                    const detailContent =
                      !isGroup && showDetailExpand && getDetailPanelContent
                        ? getDetailPanelContent({ id, row })
                        : null;
                    const canExpandDetail = detailContent != null;
                    const detailOpen =
                      canExpandDetail && detailExpandedSet.has(id);

                    return (
                      <React.Fragment key={id}>
                        <TableRow
                          data-index={rowIndexOnPage}
                          data-tree-kind={tree?.kind}
                          data-state={
                            isSelected
                              ? "selected"
                              : isActive
                                ? "active"
                                : undefined
                          }
                          className={cn(
                            onRowClick && !isGroup && "cursor-pointer",
                            isGroup && "bg-muted/20 font-medium",
                            classNames?.row,
                            resolvedRowClassName,
                          )}
                          style={styles?.row}
                          onClick={() => {
                            if (isGroup) return;
                            onRowClick?.(row, index);
                          }}
                        >
                          {selectable ? (
                            <TableCell
                              className={cn(
                                "bg-card",
                                densityCell,
                                cellBorderClass,
                                (stickyFirstColumn ||
                                  leftPinnedKeys.length > 0) &&
                                  "sticky left-0 z-20",
                                isSelected && "bg-muted/40",
                                classNames?.cell,
                              )}
                            >
                              {canSelect ? (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => selection.toggle(id)}
                                  aria-label={locale.selectRowAria(id)}
                                  onClick={(event) => event.stopPropagation()}
                                />
                              ) : null}
                            </TableCell>
                          ) : null}

                          {showDetailExpand ? (
                            <TableCell
                              className={cn(
                                "bg-card",
                                densityCell,
                                cellBorderClass,
                                isSelected && "bg-muted/40",
                                classNames?.cell,
                              )}
                              style={{ width: DETAIL_EXPAND_COLUMN_WIDTH }}
                            >
                              {canExpandDetail ? (
                                <DetailExpandButton
                                  expanded={detailOpen}
                                  onToggle={() => toggleDetailExpanded(id)}
                                  variant="detail"
                                />
                              ) : null}
                            </TableCell>
                          ) : null}

                          {sn ? (
                            <SnCell
                              value={getSerialNumber(
                                page,
                                pageSize,
                                rowIndexOnPage,
                              )}
                              className={cn(
                                cellBorderClass,
                                (stickyFirstColumn ||
                                  leftPinnedKeys.length > 0) &&
                                  "sticky z-20",
                                isSelected && "bg-muted/40",
                                classNames?.cell,
                              )}
                              style={
                                stickyFirstColumn || leftPinnedKeys.length > 0
                                  ? {
                                      left:
                                        (selectable ? 40 : 0) +
                                        (showDetailExpand
                                          ? DETAIL_EXPAND_COLUMN_WIDTH
                                          : 0),
                                    }
                                  : undefined
                              }
                            />
                          ) : null}

                          {visibleColumns.map((column, columnIndex) => {
                            const rawValue =
                              isGroup && columnIndex === 0
                                ? (tree?.label ?? "")
                                : isGroup
                                  ? ""
                                  : getCellValue(row, column.key);
                            const textValue =
                              rawValue == null ? "" : String(rawValue);
                            const content =
                              isGroup && columnIndex === 0
                                ? null
                                : isGroup
                                  ? null
                                  : column.cell
                                    ? column.cell(row, index)
                                    : textValue;
                            const pinnedSide = resolvePinnedSide(
                              column.key,
                              pinnedColumns,
                              column.pinned ??
                                (column.sticky ? "left" : undefined),
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
                            const canEdit =
                              !isGroup && isColumnEditable(column);
                            const cellEditing =
                              !isGroup && editing.isEditingCell(id, column.key);
                            const editValue =
                              editing.draft[column.key] !== undefined
                                ? editing.draft[column.key]
                                : rawValue;
                            const keyboardProps =
                              enableKeyboardNavigation && !isGroup
                                ? keyboard.getCellProps(
                                    rowIndexOnPage,
                                    columnIndex,
                                  )
                                : null;
                            const showTreeChrome =
                              treeEnabled && columnIndex === 0 && tree != null;

                            return (
                              <TableCell
                                key={column.key}
                                data-table-cell={
                                  isGroup
                                    ? undefined
                                    : `${rowIndexOnPage}:${columnIndex}`
                                }
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
                                  enableKeyboardNavigation &&
                                    !isGroup &&
                                    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[focused=true]:ring-2 data-[focused=true]:ring-ring/50",
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
                                  ...styles?.cell,
                                }}
                                {...keyboardProps}
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
                                    aria-label={locale.editFieldAria(
                                      column.header,
                                    )}
                                    onChange={(next) =>
                                      editing.setDraftValue(column.key, next)
                                    }
                                    onCommit={(reason) => {
                                      if (editMode === "row") return;
                                      void editing.commitCellEdit(reason);
                                    }}
                                    onCancel={() =>
                                      editing.cancelEdit("escape")
                                    }
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
                                ) : showTreeChrome ? (
                                  <div
                                    className="flex min-w-0 items-center gap-0.5"
                                    style={{
                                      paddingLeft: `${(tree?.depth ?? 0) * 1.05}rem`,
                                    }}
                                  >
                                    {isGroup ? (
                                      <DetailExpandButton
                                        expanded={expandedTreeIdSet.has(id)}
                                        onToggle={() => toggleTreeExpanded(id)}
                                        variant="group"
                                        className="size-6"
                                      />
                                    ) : (
                                      <span className="inline-block size-6 shrink-0" />
                                    )}
                                    <CellContent
                                      wrap={column.wrap}
                                      truncate={truncate}
                                      title={
                                        isGroup
                                          ? tree?.label
                                          : truncate && !column.cell
                                            ? textValue
                                            : undefined
                                      }
                                    >
                                      {isGroup ? tree?.label : content}
                                    </CellContent>
                                  </div>
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
                                  showRowEditControls &&
                                    editing.isEditingRow(id)
                                    ? 88
                                    : actionsColumnWidth,
                                ),
                                minWidth: Math.max(
                                  actionsColumnWidth,
                                  showRowEditControls &&
                                    editing.isEditingRow(id)
                                    ? 88
                                    : actionsColumnWidth,
                                ),
                              }}
                            >
                              {!isGroup ? (
                                <div className="flex items-center justify-end gap-0.5">
                                  {showRowEditControls &&
                                  editing.isEditingRow(id) ? (
                                    <>
                                      <Button
                                        type="button"
                                        size="icon-xs"
                                        variant="ghost"
                                        aria-label={locale.saveRowAria}
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
                                        aria-label={locale.cancelEditAria}
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
                                        permissions:
                                          actionsOptions?.permissions,
                                        canAccess: actionsOptions?.canAccess,
                                      })}
                                      display={resolvedActionsDisplay}
                                      placement={popoverPlacement}
                                      offsetDistance={popoverOffset}
                                      radiusClass={radiusClass}
                                      menuAriaLabel={
                                        actionsOptions?.menuAriaLabel ??
                                        locale.rowActionsAria(id)
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
                                      menuAriaLabel={locale.rowActionsAria(id)}
                                    >
                                      {renderRowActions(row)}
                                    </RowActions>
                                  ) : null}
                                </div>
                              ) : null}
                            </TableCell>
                          ) : null}
                        </TableRow>
                        {detailOpen && canExpandDetail ? (
                          <TableRow
                            data-slot="data-table-detail-panel"
                            className="hover:bg-transparent"
                          >
                            <TableCell
                              colSpan={colSpan}
                              className={cn(
                                "bg-muted/20",
                                densityCell,
                                classNames?.cell,
                                classNames?.detailPanel,
                              )}
                              style={{
                                ...styles?.cell,
                                ...styles?.detailPanel,
                              }}
                              aria-label={locale.detailPanelAria}
                            >
                              {detailContent}
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </React.Fragment>
                    );
                  })}

                  {virtualization.enabled &&
                  virtualization.paddingBottom > 0 ? (
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
            style={styles?.pagination}
            radiusClass={radiusClass}
          />
        ) : null}
      </div>
    </DataTableLocaleProvider>
  );
}
