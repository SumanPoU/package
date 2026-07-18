"use client";

import type * as React from "react";
import type { ChangeEvent } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../lib/utils";
import {
  FILTER_HTML_INPUT_TYPE,
  FILTER_INPUT_PLACEHOLDER,
  titleCase,
  type FilterBuilderColumn,
} from "./types";

export type SmartValueInputProps = {
  column: FilterBuilderColumn;
  value: string;
  hasError?: boolean;
  radiusClass?: string;
  onChange: (value: string) => void;
};

const fieldBase =
  "h-7 w-full border border-input bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function SmartValueInput({
  column,
  value,
  hasError = false,
  radiusClass = "rounded-xs",
  onChange,
}: SmartValueInputProps) {
  const errCls = hasError
    ? "border-destructive/60 ring-1 ring-destructive/20"
    : "";

  if (column.type === "enum") {
    return (
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          size="sm"
          className={cn(
            "h-7 w-full border-input px-2 text-xs shadow-none data-[size=sm]:h-7",
            radiusClass,
            errCls,
          )}
        >
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={8}
          className={cn("text-xs", radiusClass)}
        >
          {(column.options ?? []).map((option) => (
            <SelectItem key={option} value={option} className="text-xs">
              {titleCase(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (column.type === "multi") {
    const selected = value ? value.split(",").filter(Boolean) : [];
    const toggle = (option: string) => {
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];
      onChange(next.join(","));
    };
    return (
      <div
        className={cn(
          "flex min-h-7 flex-wrap gap-1 border border-input bg-transparent p-1",
          radiusClass,
          errCls,
        )}
      >
        {(column.options ?? []).map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                radiusClass,
                active
                  ? "border-foreground/20 bg-muted text-foreground"
                  : "border-transparent bg-transparent text-muted-foreground hover:bg-muted/60",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  if (column.type === "boolean") {
    const checked = value === "true";
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(checked ? "false" : "true")}
        className={cn(
          "flex h-7 w-full items-center justify-between border border-input px-2 text-xs",
          radiusClass,
          errCls,
        )}
      >
        <span className="text-muted-foreground">Boolean</span>
        <span
          className={cn(
            "font-medium tabular-nums",
            checked ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
          )}
        >
          {checked ? "true" : "false"}
        </span>
      </button>
    );
  }

  if (column.type === "range") {
    const min = column.min ?? 0;
    const max = column.max ?? 100;
    const step = column.step ?? 1;
    const num = value === "" ? min : Number(value);
    return (
      <div
        className={cn(
          "flex h-7 items-center gap-2 border border-input px-2",
          radiusClass,
          errCls,
        )}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={num}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          className="h-1 flex-1 accent-foreground"
        />
        <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
          {num}
        </span>
      </div>
    );
  }

  if (column.type === "color") {
    const display = value || "#64748b";
    return (
      <div
        className={cn(
          "flex h-7 items-center gap-2 border border-input px-2",
          radiusClass,
          errCls,
        )}
      >
        <input
          type="color"
          value={display}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
          className="size-4 cursor-pointer border-0 bg-transparent p-0"
        />
        <span className="text-[11px] text-muted-foreground">{display}</span>
      </div>
    );
  }

  if (column.type === "textarea") {
    return (
      <textarea
        className={cn(
          "min-h-14 w-full resize-none border border-input bg-transparent px-2 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          radiusClass,
          errCls,
        )}
        placeholder="Enter text…"
        value={value}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
          onChange(event.target.value)
        }
      />
    );
  }

  return (
    <input
      type={FILTER_HTML_INPUT_TYPE[column.type] ?? "text"}
      className={cn(fieldBase, radiusClass, errCls)}
      placeholder={FILTER_INPUT_PLACEHOLDER[column.type] ?? ""}
      min={column.min}
      max={column.max}
      step={column.step}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)
      }
    />
  );
}
