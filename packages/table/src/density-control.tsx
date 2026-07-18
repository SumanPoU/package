"use client";

import { DENSITY_OPTIONS, type DataTableDensity } from "./types";
import { cn } from "./lib/utils";

export type DensityControlProps = {
  value: DataTableDensity;
  onChange: (value: DataTableDensity) => void;
  options?: typeof DENSITY_OPTIONS;
  className?: string;
  radiusClass?: string;
};

export function DensityControl({
  value,
  onChange,
  options = DENSITY_OPTIONS,
  className,
  radiusClass = "rounded-xs",
}: DensityControlProps) {
  return (
    <div
      data-slot="data-table-density-control"
      className={cn("inline-flex bg-muted p-0.5", radiusClass, className)}
      role="group"
      aria-label="Table density"
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            data-state={active ? "on" : "off"}
            className={cn(
              "px-2.5 py-1 text-xs font-medium transition-colors",
              radiusClass,
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
