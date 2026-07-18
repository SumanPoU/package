"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { cn } from "./lib/utils";
import { toolbarSelectTriggerClass } from "./toolbar-control";
import { DENSITY_OPTIONS, type DataTableDensity } from "./types";

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
  options = DENSITY_OPTIONS,
  className,
  radiusClass = "rounded-xs",
  sideOffset = 8,
}: DensityControlProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as DataTableDensity)}
    >
      <SelectTrigger
        size="sm"
        aria-label="Table density"
        data-slot="data-table-density-control"
        className={cn(
          toolbarSelectTriggerClass,
          "min-w-[6.5rem] data-[size=sm]:h-7",
          radiusClass,
          className,
        )}
      >
        <SelectValue placeholder="Density" />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={sideOffset}
        align="end"
        className={cn("min-w-[8.5rem] text-xs", radiusClass)}
      >
        {options.map((option) => (
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
