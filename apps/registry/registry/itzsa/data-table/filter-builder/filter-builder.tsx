"use client";

import {
  CheckIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import * as React from "react";

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
  FilterBuilderApplyPayload,
  FilterBuilderColumn,
  FilterBuilderProps,
  FilterCondition,
  FilterLogic,
  FilterOperatorValue,
} from "./types";
import {
  conditionsToSearchParams,
  FILTER_OPERATORS,
  FILTER_TYPE_META,
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
          "h-8 w-full border-input px-2.5 text-xs shadow-none data-[size=sm]:h-8",
          radiusClass,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={8}
        align="start"
        className={cn("z-[80] text-xs", radiusClass)}
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
    (
      next:
        | FilterCondition[]
        | ((prev: FilterCondition[]) => FilterCondition[]),
    ) => {
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
        No filterable columns. Set{" "}
        <code className="text-foreground">filterable</code> on a column to
        enable filters.
      </div>
    );
  }

  const updateRow = (
    id: string,
    patch: Partial<Omit<FilterCondition, "id">>,
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
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
        "overflow-hidden border border-input bg-card text-card-foreground shadow-md",
        radiusClass,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-black/[0.05] bg-muted/20 px-3.5 py-2.5 dark:border-white/[0.07]">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold tracking-wide">{title}</span>
          <span
            className={cn(
              "bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground",
              radiusClass,
            )}
          >
            {rows.length}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Only filterable columns
        </p>
      </div>

      <div className="data-table-thin-scroll flex max-h-80 flex-col overflow-y-auto">
        {rows.map((row, index) => {
          const colDef = getFilterColumnDef(columns, row.column);
          if (!colDef) return null;
          const meta = FILTER_TYPE_META[colDef.type];
          const isWide = colDef.type === "multi" || colDef.type === "textarea";
          const needsValue = valueInputRequired(colDef.type);
          const hasError = submitted && needsValue && row.value.trim() === "";
          const isFirst = index === 0;
          const isSingle = rows.length === 1;

          return (
            <div
              key={row.id}
              className={cn(
                "border-b border-black/[0.04] px-3.5 py-3 last:border-b-0 dark:border-white/[0.06]",
                hasError && "bg-destructive/5",
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-12 shrink-0 items-center justify-center">
                  {!isSingle ? (
                    isFirst ? (
                      <span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
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
                    "grid min-w-0 flex-1 gap-2.5",
                    isWide
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-3",
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    {isFirst ? (
                      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        Column
                      </p>
                    ) : null}
                    <FilterColumnSelect
                      columns={columns}
                      value={row.column}
                      radiusClass={radiusClass}
                      onChange={(next) => {
                        updateRow(row.id, { column: next, value: "" });
                      }}
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    {isFirst ? (
                      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        Operator
                      </p>
                    ) : null}
                    <OperatorSelect
                      value={row.operator}
                      onChange={(next) => updateRow(row.id, { operator: next })}
                      radiusClass={radiusClass}
                    />
                  </div>

                  {!isWide ? (
                    <div className="min-w-0 space-y-1">
                      {isFirst ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                            Value
                          </span>
                          <span
                            className={cn(
                              "px-1.5 py-0.5 text-[10px] font-medium",
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
                        onChange={(next) => updateRow(row.id, { value: next })}
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
                    "flex size-8 shrink-0 items-center justify-center text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30",
                    isFirst && "mt-5",
                    radiusClass,
                  )}
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>

              {isWide ? (
                <div className="mt-2.5 ml-14 mr-10 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Value
                    </span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] font-medium",
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
                    onChange={(next) => updateRow(row.id, { value: next })}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-black/[0.05] bg-muted/10 px-3.5 py-2.5 dark:border-white/[0.07]">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
            className={cn(
              "h-8 gap-1.5 px-2.5 text-xs text-muted-foreground",
              radiusClass,
            )}
          >
            <Trash2Icon className="size-3.5" />
            Clear
          </Button>
          <Button
            type="button"
            size="xs"
            onClick={apply}
            className={cn("h-8 gap-1.5 px-3 text-xs", radiusClass)}
          >
            <CheckIcon className="size-3.5" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
