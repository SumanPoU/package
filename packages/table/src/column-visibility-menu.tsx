"use client";

import * as React from "react";
import { Columns3Icon } from "lucide-react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";

import { Button } from "./components/ui/button";
import { Checkbox } from "./components/ui/checkbox";
import { cn } from "./lib/utils";
import type { DataTableColumn, DataTableColumnVisibility } from "./types";

export type ColumnVisibilityMenuProps<T> = {
  columns: DataTableColumn<T>[];
  visibility: DataTableColumnVisibility;
  onVisibilityChange: (next: DataTableColumnVisibility) => void;
  radiusClass?: string;
  className?: string;
};

export function ColumnVisibilityMenu<T>({
  columns,
  visibility,
  onVisibilityChange,
  radiusClass = "rounded-xs",
  className,
}: ColumnVisibilityMenuProps<T>) {
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const toggle = (key: string, visible: boolean) => {
    onVisibilityChange({ ...visibility, [key]: visible });
  };

  const showAll = () => {
    const next: DataTableColumnVisibility = {};
    for (const column of columns) next[column.key] = true;
    onVisibilityChange(next);
  };

  const hideAll = () => {
    const next: DataTableColumnVisibility = {};
    for (const column of columns) next[column.key] = false;
    onVisibilityChange(next);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        ref={refs.setReference}
        aria-expanded={open}
        aria-haspopup="menu"
        data-slot="data-table-column-selector"
        className={cn("h-8 gap-1.5 shadow-none", radiusClass, className)}
        {...getReferenceProps()}
      >
        <Columns3Icon className="size-3.5" />
        Columns
      </Button>

      {open ? (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          data-slot="data-table-column-visibility-menu"
          className={cn(
            "z-50 min-w-48 border border-border bg-popover p-2 text-popover-foreground shadow-md",
            radiusClass,
          )}
          {...getFloatingProps()}
        >
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <p className="text-xs font-medium text-muted-foreground">
              Toggle columns
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-foreground"
                onClick={showAll}
              >
                All
              </button>
              <span className="text-[11px] text-muted-foreground">/</span>
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-foreground"
                onClick={hideAll}
              >
                None
              </button>
            </div>
          </div>
          <ul className="flex max-h-64 flex-col gap-1 overflow-auto">
            {columns.map((column) => {
              const visible = visibility[column.key] !== false;
              return (
                <li key={column.key}>
                  <label className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-sm hover:bg-muted">
                    <Checkbox
                      checked={visible}
                      onCheckedChange={(checked) =>
                        toggle(column.key, checked === true)
                      }
                      aria-label={`Toggle ${column.header}`}
                    />
                    <span className="truncate">{column.header}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
}
