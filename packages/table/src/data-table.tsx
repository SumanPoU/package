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
import { cn } from "./lib/utils";
import { TablePagination } from "./table-pagination";
import { useTableSelection } from "./use-table-selection";

export type SortDirection = "asc" | "desc";

export type DataTableSort = {
  key: string;
  direction: SortDirection;
};

export type DataTableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  hideBelow?: "sm" | "md" | "lg";
  /** Optional custom cell renderer. Defaults to `String(row[key])`. */
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  selectable?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
  /** Empty-state message shown when `data` is empty. */
  emptyMessage?: string;
  /** Resolve a stable row id. Defaults to `row.id` or the row index. */
  getRowId?: (row: T, index: number) => string;
  /** Controlled selection. */
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Controlled sort. */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Highlight a single active row (e.g. keyboard/focus target). */
  activeRowId?: string | null;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
};

const HIDE_BELOW_CLASS: Record<"sm" | "md" | "lg", string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

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

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function DataTable<T>({
  data,
  columns,
  pageSize: pageSizeProp = 10,
  selectable = false,
  stickyHeader = false,
  maxHeight = "24rem",
  emptyMessage = "No results.",
  getRowId = defaultGetRowId,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  activeRowId = null,
  onRowClick,
  className,
  rowClassName,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pageSizeProp);
  const [uncontrolledSort, setUncontrolledSort] =
    React.useState<DataTableSort | null>(defaultSort);

  const isSortControlled = controlledSort !== undefined;
  const sort = isSortControlled ? controlledSort : uncontrolledSort;

  const selection = useTableSelection({
    selectedIds,
    defaultSelectedIds,
    onSelectionChange,
  });

  React.useEffect(() => {
    setPageSize(pageSizeProp);
    setPage(1);
  }, [pageSizeProp]);

  const sortedData = React.useMemo(() => {
    if (!sort) return data;

    const copy = [...data];
    copy.sort((a, b) => {
      const result = compareValues(
        getCellValue(a, sort.key),
        getCellValue(b, sort.key),
      );
      return sort.direction === "asc" ? result : -result;
    });
    return copy;
  }, [data, sort]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));

  React.useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const pageRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize).map((row, index) => ({
      row,
      index: start + index,
      id: getRowId(row, start + index),
    }));
  }, [getRowId, page, pageSize, sortedData]);

  const pageIds = pageRows.map((item) => item.id);
  const allPageSelected = selection.isAllSelected(pageIds);
  const somePageSelected = selection.isSomeSelected(pageIds);

  const colSpan = columns.length + (selectable ? 1 : 0);

  const handleSort = (key: string) => {
    const next: DataTableSort | null =
      sort?.key === key
        ? sort.direction === "asc"
          ? { key, direction: "desc" }
          : null
        : { key, direction: "asc" };

    if (!isSortControlled) {
      setUncontrolledSort(next);
    }
    onSortChange?.(next);
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const merged = Array.from(new Set([...selection.selectedIds, ...pageIds]));
      selection.selectAll(merged);
      return;
    }
    selection.selectAll(
      selection.selectedIds.filter((id) => !pageIds.includes(id)),
    );
  };

  return (
    <div
      data-slot="data-table"
      className={cn(
        "w-full overflow-hidden rounded-md border bg-background",
        className,
      )}
    >
      <div
        data-slot="data-table-scroll"
        className="relative w-full overflow-auto"
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader
            className={cn(
              stickyHeader &&
                "sticky top-0 z-20 bg-background shadow-[inset_0_-1px_0_0_var(--border)]",
            )}
          >
            <TableRow data-state="header" className="hover:bg-transparent">
              {selectable ? (
                <TableHead className="w-10">
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

              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                const direction = isSorted ? sort.direction : undefined;

                return (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                      column.headerClassName,
                    )}
                    aria-sort={
                      column.sortable
                        ? direction === "asc"
                          ? "ascending"
                          : direction === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        onClick={() => handleSort(column.key)}
                        aria-label={`Sort by ${column.header}`}
                      >
                        {column.header}
                        {direction === "asc" ? (
                          <ArrowUpIcon className="size-3.5" aria-hidden="true" />
                        ) : direction === "desc" ? (
                          <ArrowDownIcon
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <ArrowUpDownIcon
                            className="size-3.5 opacity-50"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={colSpan}
                  className="h-24 text-center text-muted-foreground"
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
                      resolvedRowClassName,
                    )}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {selectable ? (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => selection.toggle(id)}
                          aria-label={`Select row ${id}`}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </TableCell>
                    ) : null}

                    {columns.map((column) => {
                      const content = column.cell
                        ? column.cell(row, index)
                        : (() => {
                            const value = getCellValue(row, column.key);
                            return value == null ? "" : String(value);
                          })();

                      return (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.hideBelow &&
                              HIDE_BELOW_CLASS[column.hideBelow],
                            column.className,
                          )}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
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
        totalItems={sortedData.length}
        onPageChange={setPage}
        onPageSizeChange={(next) => {
          setPageSize(next);
          setPage(1);
        }}
      />
    </div>
  );
}
