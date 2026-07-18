"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { cn } from "./lib/utils";
import type { DataTableColumn, DataTableFilters } from "./types";

export type FilterBarProps<T> = {
  columns: DataTableColumn<T>[];
  filters: DataTableFilters;
  onFiltersChange: (filters: DataTableFilters) => void;
  className?: string;
  radiusClass?: string;
};

export function FilterBar<T>({
  columns,
  filters,
  onFiltersChange,
  className,
  radiusClass = "",
}: FilterBarProps<T>) {
  const filterableColumns = columns.filter((column) => column.filterable);

  if (filterableColumns.length === 0) {
    return null;
  }

  const activeCount = Object.values(filters).filter(
    (value) => value != null && String(value).trim() !== "",
  ).length;

  const setFilter = (key: string, value: string) => {
    const next = { ...filters };
    if (value.trim() === "" || value === "__all__") {
      delete next[key];
    } else {
      next[key] = value;
    }
    onFiltersChange(next);
  };

  const clearFilters = () => onFiltersChange({});

  return (
    <div
      data-slot="data-table-filter-bar"
      className={cn(
        "flex flex-wrap items-end gap-3 border-b border-black/[0.04] px-3 py-3 dark:border-white/[0.06]",
        className,
      )}
    >
      {filterableColumns.map((column) => {
        const filterType = column.filterType ?? "text";
        const value = filters[column.key] ?? "";

        return (
          <label
            key={column.key}
            className="flex min-w-40 flex-1 flex-col gap-1.5"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {column.header}
            </span>
            {filterType === "select" ? (
              <Select
                value={value || "__all__"}
                onValueChange={(next) => setFilter(column.key, next)}
              >
                <SelectTrigger
                  size="sm"
                  className={cn("h-8 w-full shadow-none", radiusClass)}
                  aria-label={`Filter by ${column.header}`}
                >
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {(column.filterOptions ?? []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <input
                type="search"
                value={value}
                onChange={(event) => setFilter(column.key, event.target.value)}
                placeholder={`Filter ${column.header.toLowerCase()}…`}
                aria-label={`Filter by ${column.header}`}
                className={cn(
                  "h-8 w-full border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  radiusClass,
                )}
              />
            )}
          </label>
        );
      })}

      {activeCount > 0 ? (
        <div className="flex items-center gap-2 pb-0.5">
          <span className="text-xs text-muted-foreground">
            {activeCount} active
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className={cn("h-8 gap-1 px-2 text-muted-foreground", radiusClass)}
          >
            <XIcon className="size-3.5" />
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
