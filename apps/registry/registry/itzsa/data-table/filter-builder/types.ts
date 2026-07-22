import type * as React from "react";

export type FilterLogic = "AND" | "OR";

export type FilterColumnType =
  | "string"
  | "textarea"
  | "number"
  | "range"
  | "date"
  | "datetime"
  | "time"
  | "boolean"
  | "email"
  | "url"
  | "color"
  | "enum"
  | "multi";

export type FilterOperatorValue =
  | "equals"
  | "not_equals"
  | "contains"
  | "gt"
  | "lt"
  | "gte"
  | "lte";

export type FilterBuilderColumn = {
  value: string;
  label: string;
  type: FilterColumnType;
  options?: readonly string[];
  min?: number;
  max?: number;
  step?: number;
};

export type FilterOperator = {
  value: FilterOperatorValue;
  label: string;
  sym: string;
};

export type FilterCondition = {
  id: string;
  column: string;
  operator: FilterOperatorValue;
  value: string;
  logic: FilterLogic;
};

export type FilterBuilderApplyPayload = {
  conditions: FilterCondition[];
  /** Query-string params (`column[0]=value&…`). `null` when cleared. */
  params: URLSearchParams | null;
};

export type FilterBuilderProps = {
  columns: readonly FilterBuilderColumn[];
  /** Controlled conditions. */
  value?: FilterCondition[];
  defaultValue?: FilterCondition[];
  onChange?: (conditions: FilterCondition[]) => void;
  onApply?: (payload: FilterBuilderApplyPayload) => void;
  onClear?: () => void;
  className?: string;
  radiusClass?: string;
  /** Compact panel title. */
  title?: string;
};

export const FILTER_OPERATORS: readonly FilterOperator[] = [
  { value: "equals", label: "Equals", sym: "=" },
  { value: "not_equals", label: "Not equals", sym: "≠" },
  { value: "contains", label: "Contains", sym: "⊃" },
  { value: "gt", label: "Greater than", sym: ">" },
  { value: "lt", label: "Less than", sym: "<" },
  { value: "gte", label: "Greater or equal", sym: "≥" },
  { value: "lte", label: "Less or equal", sym: "≤" },
];

export const FILTER_TYPE_META: Record<
  FilterColumnType,
  { label: string; dot: string; badge: string }
> = {
  string: {
    label: "str",
    dot: "bg-muted-foreground/50",
    badge: "bg-muted text-muted-foreground",
  },
  textarea: {
    label: "text",
    dot: "bg-muted-foreground/50",
    badge: "bg-muted text-muted-foreground",
  },
  number: {
    label: "num",
    dot: "bg-sky-500",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  range: {
    label: "range",
    dot: "bg-cyan-500",
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  },
  date: {
    label: "date",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  datetime: {
    label: "dt",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  time: {
    label: "time",
    dot: "bg-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-800 dark:text-yellow-300",
  },
  boolean: {
    label: "bool",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  email: {
    label: "email",
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  url: {
    label: "url",
    dot: "bg-teal-500",
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
  },
  color: {
    label: "color",
    dot: "bg-fuchsia-500",
    badge: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  },
  enum: {
    label: "enum",
    dot: "bg-foreground/40",
    badge: "bg-muted text-muted-foreground",
  },
  multi: {
    label: "multi",
    dot: "bg-foreground/40",
    badge: "bg-muted text-muted-foreground",
  },
};

export const FILTER_HTML_INPUT_TYPE: Partial<Record<FilterColumnType, string>> =
  {
    number: "number",
    date: "date",
    datetime: "datetime-local",
    time: "time",
    email: "email",
    url: "url",
    string: "text",
  };

export const FILTER_INPUT_PLACEHOLDER: Partial<
  Record<FilterColumnType, string>
> = {
  number: "0",
  email: "you@example.com",
  url: "https://…",
  string: "Enter value…",
};

let filterConditionSeq = 0;

export function createFilterConditionId(): string {
  filterConditionSeq += 1;
  return `fc-${filterConditionSeq}`;
}

export function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function makeFilterCondition(
  columns: readonly FilterBuilderColumn[],
  logic: FilterLogic = "AND",
): FilterCondition {
  return {
    id: createFilterConditionId(),
    column: columns[0]?.value ?? "",
    operator: FILTER_OPERATORS[0]!.value,
    value: "",
    logic,
  };
}

export function getFilterColumnDef(
  columns: readonly FilterBuilderColumn[],
  columnKey: string,
): FilterBuilderColumn | undefined {
  return columns.find((column) => column.value === columnKey) ?? columns[0];
}

export function valueInputRequired(type: FilterColumnType): boolean {
  return !["boolean", "range", "color"].includes(type);
}

export function conditionsToSearchParams(
  conditions: FilterCondition[],
): URLSearchParams {
  const params = new URLSearchParams();
  const counters: Record<string, number> = {};
  for (const row of conditions) {
    const idx = counters[row.column] ?? 0;
    counters[row.column] = idx + 1;
    params.append(`${row.column}[${idx}]`, row.value);
    params.append(`${row.column}[${idx}].op`, row.operator);
    if (idx > 0) {
      params.append(`${row.column}[${idx}].logic`, row.logic);
    }
  }
  return params;
}

function compareFilterValues(
  cell: unknown,
  filterValue: string,
  operator: FilterOperatorValue,
): boolean {
  const cellStr = cell == null ? "" : String(cell);
  const needle = filterValue;

  switch (operator) {
    case "equals":
      return cellStr.toLowerCase() === needle.toLowerCase();
    case "not_equals":
      return cellStr.toLowerCase() !== needle.toLowerCase();
    case "contains":
      return cellStr.toLowerCase().includes(needle.toLowerCase());
    case "gt":
    case "lt":
    case "gte":
    case "lte": {
      const a = Number(cell);
      const b = Number(needle);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        if (operator === "gt") return a > b;
        if (operator === "lt") return a < b;
        if (operator === "gte") return a >= b;
        return a <= b;
      }
      const cmp = cellStr.localeCompare(needle, undefined, {
        numeric: true,
        sensitivity: "base",
      });
      if (operator === "gt") return cmp > 0;
      if (operator === "lt") return cmp < 0;
      if (operator === "gte") return cmp >= 0;
      return cmp <= 0;
    }
    default:
      return true;
  }
}

export function matchFilterCondition<T>(
  row: T,
  condition: FilterCondition,
  getValue: (row: T, key: string) => unknown,
): boolean {
  const cell = getValue(row, condition.column);
  if (condition.operator === "contains" && condition.value.includes(",")) {
    // multi: any selected token matches
    const tokens = condition.value.split(",").filter(Boolean);
    const cellStr = String(cell ?? "").toLowerCase();
    return tokens.some((token) => cellStr.includes(token.toLowerCase()));
  }
  return compareFilterValues(cell, condition.value, condition.operator);
}

/** Left-to-right AND/OR evaluation across conditions. */
export function matchesFilterConditions<T>(
  row: T,
  conditions: FilterCondition[],
  getValue: (row: T, key: string) => unknown,
): boolean {
  if (conditions.length === 0) return true;
  let result = matchFilterCondition(row, conditions[0]!, getValue);
  for (let i = 1; i < conditions.length; i += 1) {
    const condition = conditions[i]!;
    const matched = matchFilterCondition(row, condition, getValue);
    result = condition.logic === "AND" ? result && matched : result || matched;
  }
  return result;
}

/** Map DataTable columns → filter-builder columns (filterable only). */
export function toFilterBuilderColumns<T>(
  columns: Array<{
    key: string;
    header: string;
    filterable?: boolean;
    filterType?: string;
    filterOptions?: string[];
    filterMin?: number;
    filterMax?: number;
    filterStep?: number;
  }>,
): FilterBuilderColumn[] {
  return columns
    .filter((column) => column.filterable)
    .map((column) => {
      const raw = column.filterType ?? "string";
      const type = normalizeFilterColumnType(raw);
      return {
        value: column.key,
        label: column.header,
        type,
        options: column.filterOptions,
        min: column.filterMin,
        max: column.filterMax,
        step: column.filterStep,
      };
    });
}

function normalizeFilterColumnType(raw: string): FilterColumnType {
  if (raw === "text") return "string";
  if (raw === "select") return "enum";
  const allowed: FilterColumnType[] = [
    "string",
    "textarea",
    "number",
    "range",
    "date",
    "datetime",
    "time",
    "boolean",
    "email",
    "url",
    "color",
    "enum",
    "multi",
  ];
  return (
    allowed.includes(raw as FilterColumnType) ? raw : "string"
  ) as FilterColumnType;
}

export type { React as FilterBuilderReact };
