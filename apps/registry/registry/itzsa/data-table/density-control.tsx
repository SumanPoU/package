"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { cn } from "./lib/utils";
import { useDataTableLocale } from "./locale-text";
import { toolbarSelectTriggerClass } from "./toolbar-control";
import { type DataTableDensity, DENSITY_OPTIONS } from "./types";

export type DensityControlProps = {
  value: DataTableDensity;
  onChange: (value: DataTableDensity) => void;
  options?: typeof DENSITY_OPTIONS;
  className?: string;
  radiusClass?: string;
  /** Popper offset from the trigger (px). */
  sideOffset?: number;
};

export function DensityControl({
  value,
  onChange,
  options,
  className,
  radiusClass = "rounded-xs",
  sideOffset = 8,
}: DensityControlProps) {
  const locale = useDataTableLocale();
  const resolvedOptions =
    options ??
    DENSITY_OPTIONS.map((option) => ({
      ...option,
      label:
        option.value === "compact"
          ? locale.densityCompact
          : option.value === "comfortable"
            ? locale.densityComfortable
            : locale.densitySpacious,
    }));

  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as DataTableDensity)}
    >
      <SelectTrigger
        size="sm"
        aria-label={locale.densityAriaLabel}
        data-slot="data-table-density-control"
        className={cn(
          toolbarSelectTriggerClass,
          "min-w-[6.5rem] data-[size=sm]:h-7",
          radiusClass,
          className,
        )}
      >
        <SelectValue placeholder={locale.densityLabel} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={sideOffset}
        align="end"
        className={cn("min-w-[8.5rem] text-xs", radiusClass)}
      >
        {resolvedOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-xs"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
