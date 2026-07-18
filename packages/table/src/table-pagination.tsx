"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

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
};

function getVisiblePages(page: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis", pageCount];
  }

  if (page >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount];
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
}: TablePaginationProps) {
  const visiblePages = getVisiblePages(page, pageCount);
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        "flex flex-col gap-3 border-t px-2 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>

          {visiblePages.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "outline"}
                size="icon-sm"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={page >= pageCount || pageCount === 0}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Last page"
            disabled={page >= pageCount || pageCount === 0}
            onClick={() => onPageChange(pageCount)}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
