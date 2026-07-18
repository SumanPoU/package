"use client";

import * as React from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { Checkbox } from "./components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { FilterBar } from "./filter-bar";
import { cn } from "./lib/utils";
import { RowActionsPopover } from "./row-actions-popover";
import { TablePagination } from "./table-pagination";
import {
  DENSITY_CELL_CLASS,
  DENSITY_HEADER_CLASS,
  HIDE_BELOW_CLASS,
  RADIUS_CLASS,
  cycleMultiSort,
  normalizeSort,
  type DataTableFilters,
  type DataTableProps,
  type DataTableSort,
  type DataTableState,
} from "./types";
import { useTableSelection } from "./use-table-selection";

export type {
  DataTableClassNames,
  DataTableColumn,
  DataTableDensity,
  DataTableFilters,
  DataTableMode,
  DataTableProps,
  DataTableRadius,
  DataTableSort,
  DataTableState,
  SortDirection,
} from "./types";

export { cycleMultiSort, normalizeSort } from "./types";

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
  pageSize: pageSizeProp = 10,
  selectable = false,
  stickyHeader = true,
  stickyFirstColumn = true,
  minTableWidth = "42rem",
  maxHeight = "28rem",
  emptyMessage = "No results.",
  getRowId = defaultGetRowId,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  sort: controlledSort,
  defaultSort = [],
  onSortChange,
  enableFiltering = false,
  filters: controlledFilters,
  defaultFilters = {},
  onFiltersChange,
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
  renderRowActions,
  density = "comfortable",
  toolbar,
}: DataTableProps<T>) {
  const isServer = mode === "server";
  const radiusClass = RADIUS_CLASS[radius];
  const densityCell = DENSITY_CELL_CLASS[density];
  const densityHeader = DENSITY_HEADER_CLASS[density];
  const showActions = typeof renderRowActions === "function";
  const showFilterBar =
    enableFiltering && columns.some((column) => column.filterable);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pageSizeProp);
  const [uncontrolledSort, setUncontrolledSort] = React.useState<DataTableSort[]>(
    normalizeSort(defaultSort),
  );
  const [uncontrolledFilters, setUncontrolledFilters] =
    React.useState<DataTableFilters>(defaultFilters);

  const isSortControlled = controlledSort !== undefined;
  const isFiltersControlled = controlledFilters !== undefined;
  const sort = isSortControlled
    ? normalizeSort(controlledSort)
    : uncontrolledSort;
  const filters = isFiltersControlled
    ? controlledFilters
    : uncontrolledFilters;

  const selection = useTableSelection({
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
  });

  const emitState = React.useCallback(
    (next: Partial<DataTableState>) => {
      onStateChange?.({
        page,
        pageSize,
        sort,
        filters,
        ...next,
      });
    },
    [filters, onStateChange, page, pageSize, sort],
  );

  React.useEffect(() => {
    setPageSize(pageSizeProp);
    setPage(1);
  }, [pageSizeProp]);

  const processedData = React.useMemo(() => {
    if (isServer) return data;
    const filtered = enableFiltering
      ? data.filter((row) => matchesFilters(row, filters))
      : data;
    return sortRows(filtered, sort);
  }, [data, enableFiltering, filters, isServer, sort]);

  const totalItems = isServer
    ? (totalRows ?? data.length)
    : processedData.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageRows = React.useMemo(() => {
    if (isServer) {
      return data.map((row, index) => ({
        row,
        index,
        id: getRowId(row, index),
      }));
    }

    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize).map((row, index) => ({
      row,
      index: start + index,
      id: getRowId(row, start + index),
    }));
  }, [data, getRowId, isServer, page, pageSize, processedData]);

  const pageIds = pageRows.map((item) => item.id);
  const allPageSelected = selection.isAllSelected(pageIds);
  const somePageSelected = selection.isSomeSelected(pageIds);
  const colSpan =
    columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0);

  const firstStickyLeft = selectable ? "2.5rem" : "0";

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
    const resolved = cycleMultiSort(sort, key, { replace: false });

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
      data-mode={mode}
      style={style}
      className={cn(
        "w-full overflow-hidden bg-card text-card-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)] dark:ring-white/10",
        radiusClass,
        classNames?.root,
        className,
      )}
    >
      {toolbar ? (
        <div
          data-slot="data-table-toolbar"
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.04] px-3 py-2.5 dark:border-white/[0.06]",
            classNames?.toolbar,
          )}
        >
          {toolbar}
        </div>
      ) : null}

      {showFilterBar ? (
        <FilterBar
          columns={columns}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className={classNames?.filterBar}
          radiusClass={radiusClass}
        />
      ) : null}

      <div
        data-slot="data-table-scroll"
        className="relative w-full overflow-auto overscroll-x-contain"
        style={{ maxHeight }}
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
          className={cn("min-w-full", classNames?.table)}
          style={{ minWidth: minTableWidth }}
        >
          <TableHeader
            className={cn(
              stickyHeader &&
                "sticky top-0 z-20 bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80",
              classNames?.header,
            )}
          >
            <TableRow
              data-state="header"
              className={cn(
                "hover:bg-transparent border-black/[0.06] dark:border-white/[0.08]",
                classNames?.headerRow,
              )}
            >
              {selectable ? (
                <TableHead
                  className={cn(
                    "w-10 bg-card",
                    densityHeader,
                    stickyFirstColumn && "sticky left-0 z-30",
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

              {columns.map((column, columnIndex) => {
                const sortIndex = sort.findIndex((item) => item.key === column.key);
                const sortRule = sortIndex >= 0 ? sort[sortIndex] : undefined;
                const isSticky =
                  column.sticky ||
                  (stickyFirstColumn && columnIndex === 0);

                return (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "bg-card",
                      densityHeader,
                      column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                      column.wrap && "whitespace-normal",
                      isSticky && "sticky z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.04)]",
                      column.headerClassName,
                      classNames?.headerCell,
                    )}
                    style={
                      isSticky
                        ? { left: stickyFirstColumn && columnIndex === 0 ? firstStickyLeft : undefined }
                        : undefined
                    }
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
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex max-w-full items-center gap-1.5 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        onClick={() => handleSort(column.key)}
                        aria-label={`Sort by ${column.header}`}
                      >
                        <span className="truncate">{column.header}</span>
                        {sortRule?.direction === "asc" ? (
                          <ArrowUpIcon className="size-3.5 shrink-0" aria-hidden="true" />
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
                      <span className="truncate">{column.header}</span>
                    )}
                  </TableHead>
                );
              })}

              {showActions ? (
                <TableHead
                  className={cn(
                    "w-10 bg-card",
                    densityHeader,
                    classNames?.headerCell,
                  )}
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
              pageRows.map(({ row, index, id }) => {
                const isSelected = selection.isSelected(id);
                const isActive = activeRowId === id;
                const resolvedRowClassName =
                  typeof rowClassName === "function"
                    ? rowClassName(row, index)
                    : rowClassName;

                return (
                  <TableRow
                    key={id}
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
                          stickyFirstColumn && "sticky left-0 z-10",
                          isSelected && "bg-muted/60",
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

                    {columns.map((column, columnIndex) => {
                      const content = column.cell
                        ? column.cell(row, index)
                        : (() => {
                            const value = getCellValue(row, column.key);
                            return value == null ? "" : String(value);
                          })();
                      const isSticky =
                        column.sticky ||
                        (stickyFirstColumn && columnIndex === 0);

                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            "bg-card",
                            densityCell,
                            column.hideBelow &&
                              HIDE_BELOW_CLASS[column.hideBelow],
                            column.wrap
                              ? "whitespace-normal break-words"
                              : "whitespace-nowrap",
                            isSticky &&
                              "sticky z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.04)]",
                            isSelected && "bg-muted/60",
                            column.className,
                            classNames?.cell,
                          )}
                          style={
                            isSticky && stickyFirstColumn && columnIndex === 0
                              ? { left: firstStickyLeft }
                              : undefined
                          }
                        >
                          {content}
                        </TableCell>
                      );
                    })}

                    {showActions ? (
                      <TableCell
                        className={cn("bg-card", densityCell, classNames?.cell)}
                      >
                        <RowActionsPopover
                          placement={popoverPlacement}
                          offsetDistance={popoverOffset}
                          radiusClass={radiusClass}
                          aria-label={`Actions for row ${id}`}
                        >
                          {renderRowActions(row)}
                        </RowActionsPopover>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        className={classNames?.pagination}
        radiusClass={radiusClass}
      />
    </div>
  );
}
