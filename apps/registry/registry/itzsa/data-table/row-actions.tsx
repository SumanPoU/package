"use client";

import * as React from "react";
import type { Placement } from "@floating-ui/react";

import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { RowActionsPopover } from "./row-actions-popover";
import {
  isRowActionDisabled,
  splitRowActionsByDisplay,
  type DataTableActionsDisplay,
  type DataTableRowAction,
} from "./types";

export type RowActionsProps<T> = {
  row: T;
  actions: DataTableRowAction<T>[];
  display?: DataTableActionsDisplay;
  children?: React.ReactNode;
  placement?: Placement;
  offsetDistance?: number;
  radiusClass?: string;
  menuAriaLabel?: string;
  className?: string;
};

export function RowActions<T>({
  row,
  actions,
  display = "menu",
  children,
  placement,
  offsetDistance,
  radiusClass = "rounded-xs",
  menuAriaLabel = "Row actions",
  className,
}: RowActionsProps<T>) {
  const { iconActions, menuActions } = splitRowActionsByDisplay(actions, display);
  const showMenu = menuActions.length > 0 || children != null;

  if (iconActions.length === 0 && !showMenu) return null;

  return (
    <div
      data-slot="data-table-row-actions-cell"
      className={cn("flex items-center justify-end gap-0.5", className)}
      onClick={(event) => event.stopPropagation()}
    >
      {iconActions.map((action, index) => {
        const disabled = isRowActionDisabled(action, row);
        return (
          <Button
            key={action.id ?? `${action.label}-${index}`}
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled}
            title={action.label}
            aria-label={action.label}
            className={cn(
              "text-muted-foreground",
              action.variant === "destructive" &&
                "text-destructive hover:bg-destructive/10 hover:text-destructive",
              radiusClass,
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (disabled) return;
              action.onClick(row);
            }}
          >
            {action.icon ?? (
              <span className="px-1 text-[10px] font-medium">
                {action.label.slice(0, 1)}
              </span>
            )}
          </Button>
        );
      })}

      {showMenu ? (
        <RowActionsPopover
          actions={menuActions}
          row={row}
          placement={placement}
          offsetDistance={offsetDistance}
          radiusClass={radiusClass}
          aria-label={menuAriaLabel}
        >
          {menuActions.length === 0 ? children : null}
        </RowActionsPopover>
      ) : null}
    </div>
  );
}
