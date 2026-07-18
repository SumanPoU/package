"use client";

import * as React from "react";
import {
  CheckIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../lib/utils";
import { FilterColumnSelect } from "./column-select";
import { SmartValueInput } from "./smart-value-input";
import type {
  FilterBuilderProps,
  FilterBuilderApplyPayload,
  FilterBuilderColumn,
  FilterCondition,
  FilterLogic,
  FilterOperatorValue,
} from "./types";
import {
  FILTER_OPERATORS,
  FILTER_TYPE_META,
  conditionsToSearchParams,
  getFilterColumnDef,
  makeFilterCondition,
  valueInputRequired,
} from "./types";

function LogicToggle({
  value,
  onChange,
  radiusClass,
}: {
  value: FilterLogic;
  onChange: (value: FilterLogic) => void;
  radiusClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === "AND" ? "OR" : "AND")}
      className={cn(
        "h-6 w-10 shrink-0 text-[10px] font-semibold tracking-wide transition-colors",
        radiusClass,
        value === "AND"
          ? "bg-muted text-foreground hover:bg-muted/80"
          : "bg-foreground/10 text-foreground hover:bg-foreground/15",
      )}
    >
      {value}
    </button>
  );
}

function OperatorSelect({
  value,
  onChange,
  radiusClass,
}: {
  value: FilterOperatorValue;
  onChange: (value: FilterOperatorValue) => void;
  radiusClass?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as FilterOperatorValue)}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "h-7 w-full border-input px-2 text-xs shadow-none data-[size=sm]:h-7",
          radiusClass,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={8}
        className={cn("text-xs", radiusClass)}
      >
        {FILTER_OPERATORS.map((operator) => (
          <SelectItem
            key={operator.value}
            value={operator.value}
            className="text-xs"
          >
            <span className="mr-2 text-muted-foreground tabular-nums">
              {operator.sym}
            </span>
            {operator.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FilterBuilder({
  columns,
  value,
  defaultValue,
  onChange,
  onApply,
  onClear,
  className,
  radiusClass = "rounded-xs",
  title = "Filters",
}: FilterBuilderProps) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<FilterCondition[]>(
    () =>
      defaultValue && defaultValue.length > 0
        ? defaultValue
        : [makeFilterCondition(columns)],
  );
  const [submitted, setSubmitted] = React.useState(false);

  const rows = isControlled ? value! : uncontrolled;

  const setRows = React.useCallback(
    (next: FilterCondition[] | ((prev: FilterCondition[]) => FilterCondition[])) => {
      const resolved = typeof next === "function" ? next(rows) : next;
      if (!isControlled) setUncontrolled(resolved);
      onChange?.(resolved);
    },
    [isControlled, onChange, rows],
  );

  React.useEffect(() => {
    if (columns.length === 0) return;
    const validKeys = new Set(columns.map((column) => column.value));
    const needsRepair = rows.some(
      (row) => row.column && !validKeys.has(row.column),
    );
    if (!needsRepair && rows.every((row) => row.column)) return;
    setRows((prev) =>
      prev.map((row) =>
        validKeys.has(row.column)
          ? row
          : { ...row, column: columns[0]?.value ?? "", value: "" },
      ),
    );
  }, [columns, rows, setRows]);

  if (columns.length === 0) {
    return (
      <div
        data-slot="data-table-filter-builder"
        className={cn(
          "border border-input bg-card px-3 py-4 text-center text-xs text-muted-foreground shadow-sm",
          radiusClass,
          className,
        )}
      >
        No filterable columns. Set <code className="text-foreground">filterable</code>{" "}
        on a column to enable filters.
      </div>
    );
  }

  const updateRow = (
    id: string,
    field: keyof FilterCondition,
    nextValue: string,
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: nextValue } : row,
      ),
    );
  };

  const updateLogic = (id: string, logic: FilterLogic) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, logic } : row)),
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, makeFilterCondition(columns, "AND")]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return [makeFilterCondition(columns)];
      }
      return prev.filter((row) => row.id !== id);
    });
  };

  const apply = () => {
    setSubmitted(true);
    const invalid = rows.some((row) => {
      const def = getFilterColumnDef(columns, row.column);
      if (!def) return true;
      return valueInputRequired(def.type) && row.value.trim() === "";
    });
    if (invalid) return;

    const payload: FilterBuilderApplyPayload = {
      conditions: rows,
      params: conditionsToSearchParams(rows),
    };
    onApply?.(payload);
  };

  const clear = () => {
    const next = [makeFilterCondition(columns)];
    setRows(next);
    setSubmitted(false);
    onClear?.();
    onApply?.({ conditions: [], params: null });
  };

  return (
    <div
      data-slot="data-table-filter-builder"
      className={cn(
        "overflow-hidden border border-input bg-card text-card-foreground shadow-sm",
        radiusClass,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-black/[0.04] px-3 py-2 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold tracking-wide uppercase">
            {title}
          </span>
          <span className="bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
            {rows.length}
          </span>
        </div>
      </div>

      <div className="data-table-thin-scroll flex max-h-72 flex-col overflow-y-auto">
        {rows.map((row, index) => {
          const colDef = getFilterColumnDef(columns, row.column);
          if (!colDef) return null;
          const meta = FILTER_TYPE_META[colDef.type];
          const isWide =
            colDef.type === "multi" || colDef.type === "textarea";
          const needsValue = valueInputRequired(colDef.type);
          const hasError =
            submitted && needsValue && row.value.trim() === "";
          const isFirst = index === 0;
          const isSingle = rows.length === 1;

          return (
            <div
              key={row.id}
              className={cn(
                "border-b border-black/[0.04] px-3 py-2 last:border-b-0 dark:border-white/[0.06]",
                hasError && "bg-destructive/5",
              )}
            >
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-11 shrink-0 items-center justify-center">
                  {!isSingle ? (
                    isFirst ? (
                      <span className="text-[10px] tracking-wide text-muted-foreground/60 uppercase">
                        where
                      </span>
                    ) : (
                      <LogicToggle
                        value={row.logic}
                        onChange={(logic) => updateLogic(row.id, logic)}
                        radiusClass={radiusClass}
                      />
                    )
                  ) : null}
                </div>

                <div
                  className={cn(
                    "grid min-w-0 flex-1 gap-2",
                    isWide
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-[1fr_0.9fr_1fr]",
                  )}
                >
                  <div className="min-w-0">
                    {isFirst ? (
                      <p className="mb-1 text-[10px] tracking-wide text-muted-foreground/60 uppercase">
                        Column
                      </p>
                    ) : null}
                    <FilterColumnSelect
                      columns={columns}
                      value={row.column}
                      radiusClass={radiusClass}
                      onChange={(next) => {
                        updateRow(row.id, "column", next);
                        updateRow(row.id, "value", "");
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    {isFirst ? (
                      <p className="mb-1 text-[10px] tracking-wide text-muted-foreground/60 uppercase">
                        Operator
                      </p>
                    ) : null}
                    <OperatorSelect
                      value={row.operator}
                      onChange={(next) =>
                        updateRow(row.id, "operator", next)
                      }
                      radiusClass={radiusClass}
                    />
                  </div>

                  {!isWide ? (
                    <div className="min-w-0">
                      {isFirst ? (
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="text-[10px] tracking-wide text-muted-foreground/60 uppercase">
                            Value
                          </span>
                          <span
                            className={cn(
                              "px-1 py-px text-[10px] font-medium",
                              radiusClass,
                              meta.badge,
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                      ) : null}
                      <SmartValueInput
                        column={colDef}
                        value={row.value}
                        hasError={hasError}
                        radiusClass={radiusClass}
                        onChange={(next) =>
                          updateRow(row.id, "value", next)
                        }
                      />
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label="Remove condition"
                  disabled={rows.length === 1}
                  onClick={() => removeRow(row.id)}
                  className={cn(
                    "mt-0 flex size-7 shrink-0 items-center justify-center text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30",
                    isFirst && "mt-5",
                    radiusClass,
                  )}
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>

              {isWide ? (
                <div className="mt-2 ml-[3.25rem] mr-9">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-[10px] tracking-wide text-muted-foreground/60 uppercase">
                      Value
                    </span>
                    <span
                      className={cn(
                        "px-1 py-px text-[10px] font-medium",
                        radiusClass,
                        meta.badge,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <SmartValueInput
                    column={colDef}
                    value={row.value}
                    hasError={hasError}
                    radiusClass={radiusClass}
                    onChange={(next) => updateRow(row.id, "value", next)}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-black/[0.04] px-3 py-2 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <PlusIcon className="size-3.5" />
          Add condition
        </button>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={clear}
            className={cn("h-7 gap-1 text-xs text-muted-foreground", radiusClass)}
          >
            <Trash2Icon className="size-3" />
            Clear
          </Button>
          <Button
            type="button"
            size="xs"
            onClick={apply}
            className={cn("h-7 gap-1 text-xs", radiusClass)}
          >
            <CheckIcon className="size-3" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
