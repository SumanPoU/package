"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";

import { cn } from "../lib/utils";
import { FILTER_TYPE_META, type FilterBuilderColumn } from "./types";

export type FilterColumnSelectProps = {
  columns: readonly FilterBuilderColumn[];
  value: string;
  onChange: (value: string) => void;
  radiusClass?: string;
};

export function FilterColumnSelect({
  columns,
  value,
  onChange,
  radiusClass = "rounded-xs",
}: FilterColumnSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = React.useMemo(
    () => columns.find((column) => column.value === value),
    [columns, value],
  );
  const meta = selected ? FILTER_TYPE_META[selected.type] : null;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next) => {
      setOpen(next);
      if (!next) setQuery("");
    },
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${Math.max(rects.reference.width, 220)}px`,
          });
        },
      }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const filtered = columns.filter((column) => {
    const haystack =
      `${column.label} ${column.value} ${column.type}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        aria-expanded={open}
        data-slot="data-table-filter-column-trigger"
        className={cn(
          "inline-flex h-8 w-full items-center justify-between gap-1.5 border border-input bg-background px-2.5 text-xs shadow-none outline-none transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          radiusClass,
        )}
        {...getReferenceProps({
          onClick: (event) => event.stopPropagation(),
          onPointerDown: (event) => event.stopPropagation(),
        })}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          {meta ? (
            <span
              className={cn("size-1.5 shrink-0 rounded-full", meta.dot)}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate font-medium">
            {selected?.label ?? "Select column"}
          </span>
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-40" />
      </button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            data-slot="data-table-filter-column-select"
            className={cn(
              "z-[80] overflow-hidden border border-input bg-popover text-popover-foreground shadow-lg",
              radiusClass,
            )}
            {...getFloatingProps({
              onClick: (event) => event.stopPropagation(),
              onPointerDown: (event) => event.stopPropagation(),
            })}
          >
            <div className="border-b border-black/[0.04] p-1.5 dark:border-white/[0.06]">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  autoFocus
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && filtered[0]) {
                      event.preventDefault();
                      pick(filtered[0].value);
                    }
                  }}
                  placeholder="Search columns…"
                  className={cn(
                    "h-8 w-full border border-input bg-transparent py-1 pr-2 pl-8 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    radiusClass,
                  )}
                />
              </div>
            </div>
            <ul className="data-table-thin-scroll max-h-56 overflow-auto p-1">
              {filtered.length === 0 ? (
                <li className="px-2 py-4 text-center text-xs text-muted-foreground">
                  No column found
                </li>
              ) : (
                filtered.map((column) => {
                  const itemMeta = FILTER_TYPE_META[column.type];
                  const active = value === column.value;
                  return (
                    <li key={column.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={cn(
                          "flex w-full items-center gap-2 px-2 py-2 text-left text-xs transition-colors",
                          radiusClass,
                          active
                            ? "bg-muted text-foreground"
                            : "hover:bg-muted/70",
                        )}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          pick(column.value);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "size-3.5 shrink-0",
                            active ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            itemMeta.dot,
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {column.label}
                        </span>
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[10px] font-medium",
                            radiusClass,
                            itemMeta.badge,
                          )}
                        >
                          {itemMeta.label}
                        </span>
                      </button>
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
