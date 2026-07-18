"use client";

import * as React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeOffIcon,
  MoreVerticalIcon,
  PinIcon,
  PinOffIcon,
} from "lucide-react";
import {
  FloatingPortal,
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
import { cn } from "./lib/utils";
import type { DataTableSort, SortDirection } from "./types";

export type ColumnHeaderMenuProps = {
  columnKey: string;
  header: string;
  sortable?: boolean;
  sortRule?: DataTableSort;
  pinned?: "left" | "right" | false;
  radiusClass?: string;
  popoverOffset?: number;
  onSort?: (direction: SortDirection | null) => void;
  onHide?: () => void;
  onPin?: (side: "left" | "right" | null) => void;
};

export function ColumnHeaderMenu({
  columnKey,
  header,
  sortable = false,
  sortRule,
  pinned = false,
  radiusClass = "rounded-xs",
  popoverOffset = 8,
  onSort,
  onHide,
  onPin,
}: ColumnHeaderMenuProps) {
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
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

  const itemClass =
    "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-muted outline-none";

  const runAction = (action: () => void) => (event: React.PointerEvent) => {
    // PointerDown runs before dismiss unmounts the floating menu.
    event.preventDefault();
    event.stopPropagation();
    action();
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        ref={refs.setReference}
        aria-label={`${header} column menu`}
        aria-expanded={open}
        data-slot="data-table-column-menu-trigger"
        className={cn(
          "size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/th:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
          open && "opacity-100",
          radiusClass,
        )}
        data-state={open ? "open" : "closed"}
        {...getReferenceProps({
          onClick: (event) => event.stopPropagation(),
        })}
      >
        <MoreVerticalIcon className="size-3.5" />
      </Button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            data-slot="data-table-column-menu"
            data-column-key={columnKey}
            className={cn(
              "z-50 min-w-44 border border-input bg-popover p-1 text-popover-foreground shadow-md",
              radiusClass,
            )}
            {...getFloatingProps({
              onClick: (event) => event.stopPropagation(),
            })}
          >
            {sortable ? (
              <>
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onPointerDown={runAction(() => onSort?.("asc"))}
                >
                  <ArrowUpIcon className="size-3.5" />
                  Sort ascending
                  {sortRule?.direction === "asc" ? (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      Active
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  onPointerDown={runAction(() => onSort?.("desc"))}
                >
                  <ArrowDownIcon className="size-3.5" />
                  Sort descending
                  {sortRule?.direction === "desc" ? (
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      Active
                    </span>
                  ) : null}
                </button>
                {sortRule ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={itemClass}
                    onPointerDown={runAction(() => onSort?.(null))}
                  >
                    Clear sort
                  </button>
                ) : null}
                <div className="my-1 h-px bg-border" />
              </>
            ) : null}

            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onPointerDown={runAction(() =>
                onPin?.(pinned === "left" ? null : "left"),
              )}
            >
              {pinned === "left" ? (
                <PinOffIcon className="size-3.5" />
              ) : (
                <PinIcon className="size-3.5" />
              )}
              {pinned === "left" ? "Unpin" : "Pin left"}
            </button>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onPointerDown={runAction(() =>
                onPin?.(pinned === "right" ? null : "right"),
              )}
            >
              {pinned === "right" ? (
                <PinOffIcon className="size-3.5" />
              ) : (
                <PinIcon className="size-3.5 rotate-90" />
              )}
              {pinned === "right" ? "Unpin" : "Pin right"}
            </button>

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onPointerDown={runAction(() => onHide?.())}
            >
              <EyeOffIcon className="size-3.5" />
              Hide column
            </button>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
