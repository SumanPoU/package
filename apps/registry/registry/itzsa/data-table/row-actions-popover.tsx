"use client";

import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  type Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { MoreHorizontalIcon } from "lucide-react";
import * as React from "react";

import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { type DataTableRowAction, isRowActionDisabled } from "./types";

export type RowActionsPopoverProps<T = unknown> = {
  /** Declarative actions for this row. */
  actions?: DataTableRowAction<T>[];
  row?: T;
  /** Custom menu body — used when `actions` is empty/omitted. */
  children?: React.ReactNode;
  placement?: Placement;
  offsetDistance?: number;
  radiusClass?: string;
  "aria-label"?: string;
};

export function RowActionsPopover<T>({
  actions,
  row,
  children,
  placement = "bottom-start",
  offsetDistance = 8,
  radiusClass = "rounded-none",
  "aria-label": ariaLabel = "Row actions",
}: RowActionsPopoverProps<T>) {
  const [open, setOpen] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetDistance),
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

  const hasActions = Boolean(actions?.length);
  const hasChildren = children != null && children !== false;

  if (!hasActions && !hasChildren) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        ref={refs.setReference}
        aria-label={ariaLabel}
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        className={cn("text-muted-foreground", radiusClass)}
        {...getReferenceProps({
          onClick: (event) => event.stopPropagation(),
        })}
      >
        <MoreHorizontalIcon />
      </Button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            data-slot="data-table-row-actions-menu"
            data-state="open"
            className={cn(
              "z-50 min-w-40 border border-input bg-popover p-1 text-popover-foreground shadow-md outline-none",
              radiusClass,
            )}
            {...getFloatingProps({
              onClick: (event) => event.stopPropagation(),
            })}
          >
            {hasActions && row !== undefined
              ? actions!.map((action, index) => {
                  const disabled = isRowActionDisabled(action, row);
                  return (
                    <button
                      key={action.id ?? `${action.label}-${index}`}
                      type="button"
                      role="menuitem"
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm outline-none hover:bg-muted disabled:pointer-events-none disabled:opacity-50",
                        action.variant === "destructive" &&
                          "text-destructive hover:bg-destructive/10",
                        radiusClass,
                      )}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (disabled) return;
                        action.onClick(row);
                        setOpen(false);
                      }}
                    >
                      {action.icon}
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })
              : children}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
