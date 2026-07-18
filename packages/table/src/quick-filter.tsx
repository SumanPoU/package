"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { cn } from "./lib/utils";

export type QuickFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  radiusClass?: string;
  className?: string;
};

export function QuickFilter({
  value,
  onChange,
  placeholder = "Search…",
  radiusClass = "rounded-xs",
  className,
}: QuickFilterProps) {
  return (
    <div
      data-slot="data-table-quick-filter"
      className={cn("relative min-w-40 flex-1 max-w-xs", className)}
    >
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Quick filter"
        className={cn(
          "h-8 w-full border border-input bg-transparent py-1 pr-8 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          radiusClass,
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => onChange("")}
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
