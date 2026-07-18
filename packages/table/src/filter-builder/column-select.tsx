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
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${Math.max(rects.reference.width, 200)}px`,
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
    const haystack = `${column.label} ${column.value} ${column.type}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        aria-expanded={open}
        className={cn(
          "inline-flex h-7 w-full items-center justify-between gap-1.5 border border-input bg-transparent px-2 text-xs shadow-none outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          radiusClass,
        )}
        {...getReferenceProps()}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {meta ? (
            <span
              className={cn("size-1.5 shrink-0 rounded-full", meta.dot)}
              aria-hidden="true"
            />
          ) : null}
          <span className="truncate">{selected?.label ?? "Select column"}</span>
        </span>
        <ChevronsUpDownIcon className="size-3 shrink-0 opacity-40" />
      </button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className={cn(
              "z-50 border border-input bg-popover p-1 text-popover-foreground shadow-md",
              radiusClass,
            )}
            {...getFloatingProps()}
          >
            <div className="relative mb-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search columns…"
                className={cn(
                  "h-7 w-full border border-input bg-transparent py-1 pr-2 pl-7 text-xs outline-none placeholder:text-muted-foreground",
                  radiusClass,
                )}
              />
            </div>
            <ul className="data-table-thin-scroll max-h-48 overflow-auto">
              {filtered.length === 0 ? (
                <li className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                  No column found
                </li>
              ) : (
                filtered.map((column) => {
                  const itemMeta = FILTER_TYPE_META[column.type];
                  return (
                    <li key={column.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={value === column.value}
                        className={cn(
                          "flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-muted",
                          radiusClass,
                        )}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          onChange(column.value);
                          setOpen(false);
                          setQuery("");
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            "size-3 shrink-0",
                            value === column.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            itemMeta.dot,
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {column.label}
                        </span>
                        <span
                          className={cn(
                            "px-1 py-px text-[10px] font-medium",
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
