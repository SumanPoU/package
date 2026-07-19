"use client";

import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { ChevronDownIcon, Columns3Icon, SearchIcon } from "lucide-react";
import * as React from "react";

import { Checkbox } from "./components/ui/checkbox";
import { cn } from "./lib/utils";
import { useDataTableLocale } from "./locale-text";
import { toolbarSelectTriggerClass } from "./toolbar-control";
import type { DataTableColumn, DataTableColumnVisibility } from "./types";

export type ColumnVisibilityMenuProps<T> = {
  columns: DataTableColumn<T>[];
  visibility: DataTableColumnVisibility;
  onVisibilityChange: (next: DataTableColumnVisibility) => void;
  radiusClass?: string;
  className?: string;
  /** Floating-ui offset from the trigger. */
  popoverOffset?: number;
};

export function ColumnVisibilityMenu<T>({
  columns,
  visibility,
  onVisibilityChange,
  radiusClass = "rounded-xs",
  className,
  popoverOffset = 8,
}: ColumnVisibilityMenuProps<T>) {
  const locale = useDataTableLocale();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      setOpen(next);
      if (!next) setQuery("");
    },
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(popoverOffset),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const filtered = columns.filter((column) =>
    column.header.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const toggle = (key: string, visible: boolean) => {
    onVisibilityChange({ ...visibility, [key]: visible });
  };

  const showAll = () => {
    const next: DataTableColumnVisibility = { ...visibility };
    for (const column of filtered) next[column.key] = true;
    onVisibilityChange(next);
  };

  const hideAll = () => {
    const next: DataTableColumnVisibility = { ...visibility };
    for (const column of filtered) next[column.key] = false;
    onVisibilityChange(next);
  };

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        aria-expanded={open}
        aria-haspopup="menu"
        data-slot="data-table-column-selector"
        data-state={open ? "open" : "closed"}
        className={cn(
          toolbarSelectTriggerClass,
          "min-w-[7.5rem]",
          radiusClass,
          className,
        )}
        {...getReferenceProps()}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Columns3Icon className="size-3 opacity-70" aria-hidden="true" />
          <span className="truncate">{locale.columnsLabel}</span>
        </span>
        <ChevronDownIcon className="size-3 opacity-50" aria-hidden="true" />
      </button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            data-slot="data-table-column-visibility-menu"
            className={cn(
              "z-50 w-64 border border-input bg-popover p-2 text-popover-foreground shadow-md",
              radiusClass,
            )}
            {...getFloatingProps()}
          >
            <div className="relative mb-2">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={locale.columnsSearchPlaceholder}
                aria-label={locale.columnsSearchAriaLabel}
                className={cn(
                  "h-7 w-full border border-input bg-transparent py-1 pr-2 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  radiusClass,
                )}
              />
            </div>

            <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
              <p className="text-[11px] font-medium text-muted-foreground">
                {locale.columnsCount(filtered.length)}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={showAll}
                >
                  {locale.columnsShowAll}
                </button>
                <span className="text-[11px] text-muted-foreground">/</span>
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={hideAll}
                >
                  {locale.columnsHideAll}
                </button>
              </div>
            </div>

            <ul className="data-table-thin-scroll flex max-h-56 flex-col gap-0.5 overflow-auto">
              {filtered.length === 0 ? (
                <li className="px-1 py-3 text-center text-xs text-muted-foreground">
                  {locale.columnsNoMatch}
                </li>
              ) : (
                filtered.map((column) => {
                  const visible = visibility[column.key] !== false;
                  return (
                    <li key={column.key}>
                      <label className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-xs hover:bg-muted">
                        <Checkbox
                          checked={visible}
                          onCheckedChange={(checked) =>
                            toggle(column.key, checked === true)
                          }
                          aria-label={locale.columnsToggleAria(column.header)}
                        />
                        <span className="truncate">{column.header}</span>
                      </label>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
