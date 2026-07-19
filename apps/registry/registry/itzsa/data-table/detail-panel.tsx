"use client";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { useDataTableLocale } from "./locale-text";

export const DETAIL_EXPAND_COLUMN_WIDTH = 36;

export type DetailExpandButtonProps = {
  expanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  /** Use group aria labels instead of row detail labels. */
  variant?: "detail" | "group";
};

export function DetailExpandButton({
  expanded,
  onToggle,
  disabled = false,
  className,
  variant = "detail",
}: DetailExpandButtonProps) {
  const locale = useDataTableLocale();
  const label =
    variant === "group"
      ? expanded
        ? locale.collapseGroupAria
        : locale.expandGroupAria
      : expanded
        ? locale.collapseRowAria
        : locale.expandRowAria;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      disabled={disabled}
      aria-expanded={expanded}
      aria-label={label}
      data-slot="data-table-expand-button"
      className={cn("size-7 shrink-0 text-muted-foreground", className)}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {expanded ? (
        <ChevronDownIcon className="size-3.5" />
      ) : (
        <ChevronRightIcon className="size-3.5" />
      )}
    </Button>
  );
}
