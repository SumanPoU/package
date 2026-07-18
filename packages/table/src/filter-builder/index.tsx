"use client";

import * as React from "react";
import { SlidersHorizontalIcon } from "lucide-react";
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

import { cn } from "../lib/utils";
import { useDataTableLocale } from "../locale-text";
import { toolbarSelectTriggerClass } from "../toolbar-control";
import { FilterBuilder } from "./filter-builder";
import {
  makeFilterCondition,
  type FilterBuilderApplyPayload,
  type FilterBuilderColumn,
  type FilterCondition,
} from "./types";

export type FilterBuilderMenuProps = {
  columns: readonly FilterBuilderColumn[];
  /** Currently applied conditions (empty = no active filter). */
  applied?: FilterCondition[];
  onApply?: (payload: FilterBuilderApplyPayload) => void;
  onClear?: () => void;
  radiusClass?: string;
  className?: string;
  activeCount?: number;
  popoverOffset?: number;
};

function isInsideFilterUi(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-slot='data-table-filter-builder']") ||
      target.closest("[data-slot='data-table-filter-column-select']") ||
      target.closest("[data-slot='data-table-filter-column-trigger']") ||
      target.closest("[data-slot='select-content']") ||
      target.closest("[data-radix-popper-content-wrapper]"),
  );
}

export function FilterBuilderMenu({
  columns,
  applied = [],
  onApply,
  onClear,
  radiusClass = "rounded-xs",
  className,
  activeCount = 0,
  popoverOffset = 8,
}: FilterBuilderMenuProps) {
  const locale = useDataTableLocale();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<FilterCondition[]>(() =>
    applied.length > 0 ? applied : [makeFilterCondition(columns)],
  );

  React.useEffect(() => {
    if (!open) return;
    setDraft(applied.length > 0 ? applied : [makeFilterCondition(columns)]);
  }, [applied, columns, open]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(popoverOffset),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: (event) => !isInsideFilterUi(event.target),
  });
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        aria-expanded={open}
        data-slot="data-table-filter-builder-trigger"
        className={cn(
          toolbarSelectTriggerClass,
          "min-w-[6.75rem]",
          radiusClass,
          className,
        )}
        {...getReferenceProps()}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <SlidersHorizontalIcon className="size-3 opacity-70" />
          <span className="truncate">{locale.filterBuilderLabel}</span>
          {activeCount > 0 ? (
            <span className="bg-muted px-1 py-px text-[10px] tabular-nums text-muted-foreground">
              {activeCount}
            </span>
          ) : null}
        </span>
      </button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="z-[70] w-[min(34rem,calc(100vw-1.25rem))]"
            {...getFloatingProps({
              onClick: (event) => event.stopPropagation(),
              onPointerDown: (event) => event.stopPropagation(),
            })}
          >
            <FilterBuilder
              columns={columns}
              value={draft}
              onChange={setDraft}
              radiusClass={radiusClass}
              onApply={(payload) => {
                onApply?.(payload);
                setOpen(false);
              }}
              onClear={() => {
                setDraft([makeFilterCondition(columns)]);
                onClear?.();
              }}
            />
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
