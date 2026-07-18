"use client";

// src/data-table.tsx
import * as React from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

// src/components/ui/checkbox.tsx
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/ui/checkbox.tsx
import { jsx } from "react/jsx-runtime";
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        CheckboxPrimitive.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "grid place-content-center text-current transition-none",
          children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-3.5" })
        }
      )
    }
  );
}

// src/components/ui/table.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "table",
    {
      "data-slot": "table",
      className: cn("w-full caption-bottom text-sm", className),
      ...props
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "tfoot",
    {
      "data-slot": "table-footer",
      className: cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      ),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted data-[state=active]:bg-accent/60",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx2(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function TableCaption({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx2(
    "caption",
    {
      "data-slot": "table-caption",
      className: cn("mt-4 text-sm text-muted-foreground", className),
      ...props
    }
  );
}

// src/table-pagination.tsx
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon
} from "lucide-react";

// src/components/ui/button.tsx
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { jsx as jsx3 } from "react/jsx-runtime";
var buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return /* @__PURE__ */ jsx3(
    Comp,
    {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}

// src/components/ui/select.tsx
import { CheckIcon as CheckIcon2, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import { jsx as jsx4, jsxs } from "react/jsx-runtime";
function Select({
  ...props
}) {
  return /* @__PURE__ */ jsx4(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectGroup({
  ...props
}) {
  return /* @__PURE__ */ jsx4(SelectPrimitive.Group, { "data-slot": "select-group", ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsx4(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx4(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx4(ChevronDownIcon, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}) {
  return /* @__PURE__ */ jsx4(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      align,
      ...props,
      children: [
        /* @__PURE__ */ jsx4(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx4(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx4(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectLabel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx4(
    SelectPrimitive.Label,
    {
      "data-slot": "select-label",
      className: cn("px-2 py-1.5 text-xs text-muted-foreground", className),
      ...props
    }
  );
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx4(
          "span",
          {
            "data-slot": "select-item-indicator",
            className: "absolute right-2 flex size-3.5 items-center justify-center",
            children: /* @__PURE__ */ jsx4(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx4(CheckIcon2, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ jsx4(SelectPrimitive.ItemText, { children })
      ]
    }
  );
}
function SelectSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx4(
    SelectPrimitive.Separator,
    {
      "data-slot": "select-separator",
      className: cn("pointer-events-none -mx-1 my-1 h-px bg-border", className),
      ...props
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx4(
    SelectPrimitive.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx4(ChevronUpIcon, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx4(
    SelectPrimitive.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx4(ChevronDownIcon, { className: "size-4" })
    }
  );
}

// src/table-pagination.tsx
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
function getVisiblePages(page, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  if (page <= 3) {
    return [1, 2, 3, 4, "ellipsis", pageCount];
  }
  if (page >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount];
}
function TablePagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className
}) {
  const visiblePages = getVisiblePages(page, pageCount);
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      "data-slot": "table-pagination",
      className: cn(
        "flex flex-col gap-3 border-t px-2 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs2("p", { className: "text-sm text-muted-foreground", children: [
          "Showing ",
          /* @__PURE__ */ jsx5("span", { className: "font-medium text-foreground", children: from }),
          "\u2013",
          /* @__PURE__ */ jsx5("span", { className: "font-medium text-foreground", children: to }),
          " of",
          " ",
          /* @__PURE__ */ jsx5("span", { className: "font-medium text-foreground", children: totalItems })
        ] }),
        /* @__PURE__ */ jsxs2("div", { className: "flex flex-wrap items-center gap-2", children: [
          onPageSizeChange ? /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx5("span", { className: "text-sm text-muted-foreground", children: "Rows" }),
            /* @__PURE__ */ jsxs2(
              Select,
              {
                value: String(pageSize),
                onValueChange: (value) => onPageSizeChange(Number(value)),
                children: [
                  /* @__PURE__ */ jsx5(SelectTrigger, { size: "sm", "aria-label": "Rows per page", children: /* @__PURE__ */ jsx5(SelectValue, {}) }),
                  /* @__PURE__ */ jsx5(SelectContent, { children: pageSizeOptions.map((option) => /* @__PURE__ */ jsx5(SelectItem, { value: String(option), children: option }, option)) })
                ]
              }
            )
          ] }) : null,
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx5(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "icon-sm",
                "aria-label": "First page",
                disabled: page <= 1,
                onClick: () => onPageChange(1),
                children: /* @__PURE__ */ jsx5(ChevronsLeftIcon, {})
              }
            ),
            /* @__PURE__ */ jsx5(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "icon-sm",
                "aria-label": "Previous page",
                disabled: page <= 1,
                onClick: () => onPageChange(page - 1),
                children: /* @__PURE__ */ jsx5(ChevronLeftIcon, {})
              }
            ),
            visiblePages.map(
              (item, index) => item === "ellipsis" ? /* @__PURE__ */ jsx5(
                "span",
                {
                  className: "px-1 text-sm text-muted-foreground",
                  "aria-hidden": "true",
                  children: "\u2026"
                },
                `ellipsis-${index}`
              ) : /* @__PURE__ */ jsx5(
                Button,
                {
                  type: "button",
                  variant: item === page ? "default" : "outline",
                  size: "icon-sm",
                  "aria-label": `Page ${item}`,
                  "aria-current": item === page ? "page" : void 0,
                  onClick: () => onPageChange(item),
                  children: item
                },
                item
              )
            ),
            /* @__PURE__ */ jsx5(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "icon-sm",
                "aria-label": "Next page",
                disabled: page >= pageCount || pageCount === 0,
                onClick: () => onPageChange(page + 1),
                children: /* @__PURE__ */ jsx5(ChevronRightIcon, {})
              }
            ),
            /* @__PURE__ */ jsx5(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "icon-sm",
                "aria-label": "Last page",
                disabled: page >= pageCount || pageCount === 0,
                onClick: () => onPageChange(pageCount),
                children: /* @__PURE__ */ jsx5(ChevronsRightIcon, {})
              }
            )
          ] })
        ] })
      ]
    }
  );
}

// src/use-table-selection.ts
import { useCallback, useState } from "react";
function useTableSelection(options = {}) {
  const {
    selectedIds: controlledSelectedIds,
    defaultSelectedIds = [],
    onSelectionChange
  } = options;
  const [uncontrolledSelectedIds, setUncontrolledSelectedIds] = useState(defaultSelectedIds);
  const isControlled = controlledSelectedIds !== void 0;
  const selectedIds = isControlled ? controlledSelectedIds : uncontrolledSelectedIds;
  const setSelectedIds = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(selectedIds) : next;
      if (!isControlled) {
        setUncontrolledSelectedIds(resolved);
      }
      onSelectionChange?.(resolved);
    },
    [isControlled, onSelectionChange, selectedIds]
  );
  const isSelected = useCallback(
    (id) => selectedIds.includes(id),
    [selectedIds]
  );
  const toggle = useCallback(
    (id) => {
      setSelectedIds(
        (prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    },
    [setSelectedIds]
  );
  const selectAll = useCallback(
    (ids) => {
      setSelectedIds(ids);
    },
    [setSelectedIds]
  );
  const clear = useCallback(() => {
    setSelectedIds([]);
  }, [setSelectedIds]);
  const isAllSelected = useCallback(
    (ids) => ids.length > 0 && ids.every((id) => selectedIds.includes(id)),
    [selectedIds]
  );
  const isSomeSelected = useCallback(
    (ids) => ids.some((id) => selectedIds.includes(id)) && !isAllSelected(ids),
    [isAllSelected, selectedIds]
  );
  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    clear,
    isAllSelected,
    isSomeSelected
  };
}

// src/data-table.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
var HIDE_BELOW_CLASS = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell"
};
function defaultGetRowId(row, index) {
  if (row !== null && typeof row === "object" && "id" in row && (typeof row.id === "string" || typeof row.id === "number")) {
    return String(row.id);
  }
  return String(index);
}
function getCellValue(row, key) {
  if (row !== null && typeof row === "object" && key in row) {
    return row[key];
  }
  return void 0;
}
function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b), void 0, {
    numeric: true,
    sensitivity: "base"
  });
}
function DataTable({
  data,
  columns,
  pageSize: pageSizeProp = 10,
  selectable = false,
  stickyHeader = false,
  maxHeight = "24rem",
  emptyMessage = "No results.",
  getRowId = defaultGetRowId,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  activeRowId = null,
  onRowClick,
  className,
  rowClassName
}) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pageSizeProp);
  const [uncontrolledSort, setUncontrolledSort] = React.useState(defaultSort);
  const isSortControlled = controlledSort !== void 0;
  const sort = isSortControlled ? controlledSort : uncontrolledSort;
  const selection = useTableSelection({
    selectedIds,
    defaultSelectedIds,
    onSelectionChange
  });
  React.useEffect(() => {
    setPageSize(pageSizeProp);
    setPage(1);
  }, [pageSizeProp]);
  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const result = compareValues(
        getCellValue(a, sort.key),
        getCellValue(b, sort.key)
      );
      return sort.direction === "asc" ? result : -result;
    });
    return copy;
  }, [data, sort]);
  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
  React.useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);
  const pageRows = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize).map((row, index) => ({
      row,
      index: start + index,
      id: getRowId(row, start + index)
    }));
  }, [getRowId, page, pageSize, sortedData]);
  const pageIds = pageRows.map((item) => item.id);
  const allPageSelected = selection.isAllSelected(pageIds);
  const somePageSelected = selection.isSomeSelected(pageIds);
  const colSpan = columns.length + (selectable ? 1 : 0);
  const handleSort = (key) => {
    const next = sort?.key === key ? sort.direction === "asc" ? { key, direction: "desc" } : null : { key, direction: "asc" };
    if (!isSortControlled) {
      setUncontrolledSort(next);
    }
    onSortChange?.(next);
  };
  const handleSelectAll = (checked) => {
    if (checked === true) {
      const merged = Array.from(/* @__PURE__ */ new Set([...selection.selectedIds, ...pageIds]));
      selection.selectAll(merged);
      return;
    }
    selection.selectAll(
      selection.selectedIds.filter((id) => !pageIds.includes(id))
    );
  };
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      "data-slot": "data-table",
      className: cn(
        "w-full overflow-hidden rounded-md border bg-background",
        className
      ),
      children: [
        /* @__PURE__ */ jsx6(
          "div",
          {
            "data-slot": "data-table-scroll",
            className: "relative w-full overflow-auto",
            style: { maxHeight },
            children: /* @__PURE__ */ jsxs3(Table, { children: [
              /* @__PURE__ */ jsx6(
                TableHeader,
                {
                  className: cn(
                    stickyHeader && "sticky top-0 z-20 bg-background shadow-[inset_0_-1px_0_0_var(--border)]"
                  ),
                  children: /* @__PURE__ */ jsxs3(TableRow, { "data-state": "header", className: "hover:bg-transparent", children: [
                    selectable ? /* @__PURE__ */ jsx6(TableHead, { className: "w-10", children: /* @__PURE__ */ jsx6(
                      Checkbox,
                      {
                        checked: allPageSelected ? true : somePageSelected ? "indeterminate" : false,
                        onCheckedChange: handleSelectAll,
                        "aria-label": "Select all rows on this page"
                      }
                    ) }) : null,
                    columns.map((column) => {
                      const isSorted = sort?.key === column.key;
                      const direction = isSorted ? sort.direction : void 0;
                      return /* @__PURE__ */ jsx6(
                        TableHead,
                        {
                          className: cn(
                            column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                            column.headerClassName
                          ),
                          "aria-sort": column.sortable ? direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none" : void 0,
                          children: column.sortable ? /* @__PURE__ */ jsxs3(
                            "button",
                            {
                              type: "button",
                              className: "inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                              onClick: () => handleSort(column.key),
                              "aria-label": `Sort by ${column.header}`,
                              children: [
                                column.header,
                                direction === "asc" ? /* @__PURE__ */ jsx6(ArrowUpIcon, { className: "size-3.5", "aria-hidden": "true" }) : direction === "desc" ? /* @__PURE__ */ jsx6(
                                  ArrowDownIcon,
                                  {
                                    className: "size-3.5",
                                    "aria-hidden": "true"
                                  }
                                ) : /* @__PURE__ */ jsx6(
                                  ArrowUpDownIcon,
                                  {
                                    className: "size-3.5 opacity-50",
                                    "aria-hidden": "true"
                                  }
                                )
                              ]
                            }
                          ) : column.header
                        },
                        column.key
                      );
                    })
                  ] })
                }
              ),
              /* @__PURE__ */ jsx6(TableBody, { children: pageRows.length === 0 ? /* @__PURE__ */ jsx6(TableRow, { className: "hover:bg-transparent", children: /* @__PURE__ */ jsx6(
                TableCell,
                {
                  colSpan,
                  className: "h-24 text-center text-muted-foreground",
                  children: emptyMessage
                }
              ) }) : pageRows.map(({ row, index, id }) => {
                const isSelected = selection.isSelected(id);
                const isActive = activeRowId === id;
                const resolvedRowClassName = typeof rowClassName === "function" ? rowClassName(row, index) : rowClassName;
                return /* @__PURE__ */ jsxs3(
                  TableRow,
                  {
                    "data-state": isSelected ? "selected" : isActive ? "active" : void 0,
                    className: cn(
                      onRowClick && "cursor-pointer",
                      resolvedRowClassName
                    ),
                    onClick: () => onRowClick?.(row, index),
                    children: [
                      selectable ? /* @__PURE__ */ jsx6(TableCell, { children: /* @__PURE__ */ jsx6(
                        Checkbox,
                        {
                          checked: isSelected,
                          onCheckedChange: () => selection.toggle(id),
                          "aria-label": `Select row ${id}`,
                          onClick: (event) => event.stopPropagation()
                        }
                      ) }) : null,
                      columns.map((column) => {
                        const content = column.cell ? column.cell(row, index) : (() => {
                          const value = getCellValue(row, column.key);
                          return value == null ? "" : String(value);
                        })();
                        return /* @__PURE__ */ jsx6(
                          TableCell,
                          {
                            className: cn(
                              column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                              column.className
                            ),
                            children: content
                          },
                          column.key
                        );
                      })
                    ]
                  },
                  id
                );
              }) })
            ] })
          }
        ),
        /* @__PURE__ */ jsx6(
          TablePagination,
          {
            page,
            pageCount,
            pageSize,
            totalItems: sortedData.length,
            onPageChange: setPage,
            onPageSizeChange: (next) => {
              setPageSize(next);
              setPage(1);
            }
          }
        )
      ]
    }
  );
}
export {
  Button,
  Checkbox,
  DataTable,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
  buttonVariants,
  cn,
  useTableSelection
};
//# sourceMappingURL=index.mjs.map