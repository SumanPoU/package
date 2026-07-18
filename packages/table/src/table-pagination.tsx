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

export type TablePaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  radiusClass?: string;
};

/** Sliding window of at most 3 page numbers around the current page. */
function getVisiblePages(page: number, pageCount: number): number[] {
  if (pageCount <= 0) return [];
  if (pageCount <= 3) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  if (page <= 2) return [1, 2, 3];
  if (page >= pageCount - 1) {
    return [pageCount - 2, pageCount - 1, pageCount];
  }

  return [page - 1, page, page + 1];
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className,
  radiusClass = "",
}: TablePaginationProps) {
  const visiblePages = getVisiblePages(page, pageCount);
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        "flex flex-col gap-3 border-t border-black/[0.04] px-3 py-3 dark:border-white/[0.06] sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
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

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger
                size="sm"
                aria-label="Rows per page"
                className={cn("h-8 min-w-16 shadow-none", radiusClass)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={radiusClass}>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex items-center gap-0.5">
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
        </div>
      </div>
    </div>
  );
}
