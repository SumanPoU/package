"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { cn } from "./lib/utils";
import type { DataTablePaginationOptions } from "./types";

export type TablePaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  options?: DataTablePaginationOptions;
  className?: string;
  radiusClass?: string;
};

/** Sliding window of page numbers around the current page. */
function getVisiblePages(
  page: number,
  pageCount: number,
  maxVisible: number,
): number[] {
  if (pageCount <= 0) return [];
  const windowSize = Math.max(1, maxVisible);

  if (pageCount <= windowSize) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = start + windowSize - 1;

  if (end > pageCount) {
    end = pageCount;
    start = end - windowSize + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions: pageSizeOptionsProp,
  options,
  className,
  radiusClass = "",
}: TablePaginationProps) {
  const showPageSizeOptions = options?.showPageSizeOptions ?? true;
  const showPageNumbers = options?.showPageNumbers ?? true;
  const showTotal = options?.showTotal ?? true;
  const showPrevNext = options?.showPrevNext ?? true;
  const maxVisiblePages = options?.maxVisiblePages ?? 3;
  const rowsLabel = options?.rowsLabel ?? "Rows";
  const pageSizeOptions =
    options?.pageSizeOptions ?? pageSizeOptionsProp ?? [5, 10, 20, 50];

  const visiblePages = showPageNumbers
    ? getVisiblePages(page, pageCount, maxVisiblePages)
    : [];
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canChangePageSize =
    showPageSizeOptions && typeof onPageSizeChange === "function";

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        "flex flex-col gap-3 border-t border-black/[0.03] px-3 py-3 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {showTotal ? (
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="tabular-nums font-medium text-foreground">
            {from}–{to}
          </span>{" "}
          of{" "}
          <span className="tabular-nums font-medium text-foreground">
            {totalItems}
          </span>
        </p>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {canChangePageSize ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{rowsLabel}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger
                size="sm"
                aria-label="Rows per page"
                className={cn(
                  "h-7 min-w-14 border-input px-2 text-xs shadow-none data-[size=sm]:h-7 [&_svg]:size-3",
                  radiusClass,
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={8}
                className={cn("text-xs", radiusClass)}
              >
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {(showPrevNext || showPageNumbers) && pageCount > 0 ? (
          <div className="flex items-center gap-0.5">
            {showPrevNext ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className={cn("text-muted-foreground", radiusClass)}
              >
                <ChevronLeftIcon />
              </Button>
            ) : null}

            {visiblePages.map((item) => (
              <Button
                key={item}
                type="button"
                variant={item === page ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  "tabular-nums",
                  item === page
                    ? "font-semibold shadow-sm"
                    : "text-muted-foreground",
                  radiusClass,
                )}
              >
                {item}
              </Button>
            ))}

            {showPrevNext ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Next page"
                disabled={page >= pageCount || pageCount === 0}
                onClick={() => onPageChange(page + 1)}
                className={cn("text-muted-foreground", radiusClass)}
              >
                <ChevronRightIcon />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
