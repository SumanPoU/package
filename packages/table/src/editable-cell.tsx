"use client";

import type * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { cn } from "./lib/utils";
import type { DataTableEditType } from "./use-table-editing";

export type EditableCellProps = {
  value: unknown;
  editType?: DataTableEditType;
  editOptions?: string[];
  radiusClass?: string;
  autoFocus?: boolean;
  "aria-label"?: string;
  onChange: (value: unknown) => void;
  onCommit: (reason: "enter" | "blur" | "tab") => void;
  onCancel: () => void;
  renderEditCell?: (helpers: {
    value: unknown;
    setValue: (value: unknown) => void;
    commit: (reason?: "enter" | "blur" | "tab") => void;
    cancel: () => void;
  }) => React.ReactNode;
};

const inputClass =
  "h-8 w-full min-w-0 border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function EditableCell({
  value,
  editType = "text",
  editOptions = [],
  radiusClass = "rounded-xs",
  autoFocus = true,
  "aria-label": ariaLabel,
  onChange,
  onCommit,
  onCancel,
  renderEditCell,
}: EditableCellProps) {
  const stringValue = value == null ? "" : String(value);

  if (renderEditCell) {
    return (
      <div
        className="min-w-0"
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        {renderEditCell({
          value,
          setValue: onChange,
          commit: (reason = "enter") => onCommit(reason),
          cancel: onCancel,
        })}
      </div>
    );
  }

  const stop = {
    onClick: (event: React.MouseEvent) => event.stopPropagation(),
    onDoubleClick: (event: React.MouseEvent) => event.stopPropagation(),
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key === "Enter" && editType !== "textarea") {
      event.preventDefault();
      event.stopPropagation();
      onCommit("enter");
      return;
    }
    if (event.key === "Tab") {
      event.stopPropagation();
      onCommit("tab");
    }
  };

  if (editType === "boolean") {
    const checked = value === true || value === "true";
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        className={cn(
          "flex h-8 w-full items-center justify-between border border-input bg-background px-2 text-xs",
          radiusClass,
        )}
        {...stop}
        onKeyDown={onKeyDown}
        onBlur={() => onCommit("blur")}
        onClick={(event) => {
          event.stopPropagation();
          onChange(!checked);
        }}
      >
        <span className="text-muted-foreground">Boolean</span>
        <span className="font-medium">{checked ? "true" : "false"}</span>
      </button>
    );
  }

  if (editType === "select") {
    return (
      <div {...stop} onKeyDown={onKeyDown}>
        <Select
          value={stringValue || undefined}
          onValueChange={(next) => {
            onChange(next);
            // Commit after select so the menu can close cleanly.
            queueMicrotask(() => onCommit("enter"));
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label={ariaLabel}
            className={cn(
              "h-8 w-full border-input px-2 text-xs shadow-none data-[size=sm]:h-8",
              radiusClass,
            )}
          >
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            sideOffset={8}
            align="start"
            className={cn("z-[80] text-xs", radiusClass)}
          >
            {editOptions.map((option) => (
              <SelectItem key={option} value={option} className="text-xs">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (editType === "textarea") {
    return (
      <textarea
        aria-label={ariaLabel}
        className={cn(
          "min-h-16 w-full resize-y border border-input bg-background px-2 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          radiusClass,
        )}
        value={stringValue}
        {...stop}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onCommit("enter");
          }
        }}
        onBlur={() => onCommit("blur")}
      />
    );
  }

  return (
    <input
      type={editType === "number" ? "number" : "text"}
      aria-label={ariaLabel}
      className={cn(inputClass, radiusClass)}
      value={stringValue}
      {...stop}
      onChange={(event) => {
        const next = event.target.value;
        onChange(
          editType === "number" ? (next === "" ? "" : Number(next)) : next,
        );
      }}
      onKeyDown={onKeyDown}
      onBlur={() => onCommit("blur")}
    />
  );
}
