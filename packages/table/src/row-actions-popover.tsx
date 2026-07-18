"use client";

import * as React from "react";
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
  type Placement,
} from "@floating-ui/react";
import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";

export type RowActionsPopoverProps = {
  children: React.ReactNode;
  placement?: Placement;
  offsetDistance?: number;
  radiusClass?: string;
  "aria-label"?: string;
};

export function RowActionsPopover({
  children,
  placement = "bottom-start",
  offsetDistance = 8,
  radiusClass = "rounded-none",
  "aria-label": ariaLabel = "Row actions",
}: RowActionsPopoverProps) {
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
        onClick={(event) => event.stopPropagation()}
        {...getReferenceProps()}
      >
        <MoreHorizontalIcon />
      </Button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            data-slot="data-table-row-actions"
            data-state="open"
            className={cn(
              "z-50 min-w-40 border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
              radiusClass,
            )}
            onClick={(event) => event.stopPropagation()}
            {...getFloatingProps()}
          >
            {children}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
