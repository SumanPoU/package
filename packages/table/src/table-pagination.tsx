"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
import { useDataTableLocale } from "./locale-text";
import { mergePageSizeOptions, type DataTablePaginationOptions } from "./types";

export type TablePaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  options?: DataTablePaginationOptions;
  className?: string;
  style?: React.CSSProperties;
  radiusClass?: string;
};

/** Sliding window of page numbers around the current page. */
function getVisiblePages(
  page: number,
  pageCount: number,
  maxVisible: number,
): number[] {
  if (pageCount <= 0) return [];
  const windowSize = Math.max(1, maxVisible);

  if (pageCount <= windowSize) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = start + windowSize - 1;

  if (end > pageCount) {
    end = pageCount;
    start = end - windowSize + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function clampPageSize(
  value: number,
  min: number,
  max: number,
): number | null {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.floor(value);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

/** Single control: type a size and/or open the preset dropdown. */
function PageSizeCombobox({
  pageSize,
  options,
  min,
  max,
  allowCustom,
  radiusClass,
  onCommit,
}: {
  pageSize: number;
  options: number[];
  min: number;
  max: number;
  allowCustom: boolean;
  radiusClass: string;
  onCommit: (next: number) => void;
}) {
  const locale = useDataTableLocale();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(String(pageSize));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(String(pageSize));
  }, [pageSize]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top-end",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context, { enabled: !allowCustom });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const commitDraft = () => {
    if (!allowCustom) {
      setDraft(String(pageSize));
      return;
    }
    const parsed = clampPageSize(Number(draft), min, max);
    if (parsed == null) {
      setDraft(String(pageSize));
      return;
    }
    setDraft(String(parsed));
    if (parsed !== pageSize) onCommit(parsed);
  };

  const pickOption = (option: number) => {
    setDraft(String(option));
    setOpen(false);
    if (option !== pageSize) onCommit(option);
    inputRef.current?.blur();
  };

  return (
    <>
      <div
        ref={refs.setReference}
        data-slot="data-table-page-size"
        data-state={open ? "open" : "closed"}
        className={cn(
          "group/page-size inline-flex h-7 items-stretch overflow-hidden border border-input bg-transparent shadow-none transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          "hover:bg-muted/40",
          open && "border-ring ring-[3px] ring-ring/50",
          radiusClass,
        )}
        {...(allowCustom ? {} : getReferenceProps())}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          readOnly={!allowCustom}
          value={draft}
          aria-label={
            allowCustom
              ? locale.paginationCustomPageSizeAria
              : locale.paginationRowsPerPageAria
          }
          aria-expanded={open}
          aria-haspopup="listbox"
          data-slot="data-table-page-size-input"
          className={cn(
            "w-10 min-w-0 bg-transparent px-2 text-center text-xs tabular-nums text-foreground outline-none",
            "placeholder:text-muted-foreground",
            !allowCustom && "cursor-pointer",
          )}
          onChange={(event) => {
            if (!allowCustom) return;
            const next = event.target.value.replace(/[^\d]/g, "");
            setDraft(next);
          }}
          onFocus={() => {
            if (!allowCustom) setOpen(true);
          }}
          onClick={() => {
            if (!allowCustom) setOpen(true);
          }}
          onBlur={(event) => {
            const related = event.relatedTarget as HTMLElement | null;
            if (related?.closest("[data-slot='data-table-page-size-menu']")) {
              return;
            }
            commitDraft();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              return;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft();
              setOpen(false);
              return;
            }
            if (event.key === "Escape") {
              setDraft(String(pageSize));
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={locale.paginationRowsPerPageAria}
          aria-expanded={open}
          data-slot="data-table-page-size-trigger"
          className={cn(
            "inline-flex w-6 shrink-0 items-center justify-center border-l border-input/80 text-muted-foreground outline-none",
            "hover:bg-muted/60 hover:text-foreground",
            open && "bg-muted/50 text-foreground",
          )}
          onMouseDown={(event) => {
            // Keep focus on input; toggle menu without stealing blur commit race.
            event.preventDefault();
            setOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
        >
          <ChevronDownIcon
            className={cn(
              "size-3.5 opacity-60 transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            data-slot="data-table-page-size-menu"
            role="listbox"
            aria-label={locale.paginationRowsPerPageAria}
            className={cn(
              "z-50 min-w-[4.5rem] overflow-hidden border border-input bg-popover p-1 text-popover-foreground shadow-md",
              radiusClass,
            )}
            {...getFloatingProps()}
          >
            {options.map((option) => {
              const selected = option === pageSize;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full items-center justify-center rounded-[inherit] px-2 py-1.5 text-xs tabular-nums outline-none",
                    "hover:bg-muted focus-visible:bg-muted",
                    selected && "bg-muted font-medium",
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    pickOption(option);
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions: pageSizeOptionsProp,
  options,
  className,
  style,
  radiusClass = "",
}: TablePaginationProps) {
  const locale = useDataTableLocale();
  const showPageSizeOptions = options?.showPageSizeOptions ?? true;
  const allowCustomPageSize = options?.allowCustomPageSize ?? true;
  const minPageSize = options?.minPageSize ?? 1;
  const maxPageSize = options?.maxPageSize ?? 500;
  const showPageNumbers = options?.showPageNumbers ?? true;
  const showTotal = options?.showTotal ?? true;
  const showPrevNext = options?.showPrevNext ?? true;
  const maxVisiblePages = options?.maxVisiblePages ?? 3;
  const rowsLabel = options?.rowsLabel ?? locale.paginationRowsLabel;
  const pageSizeOptions = mergePageSizeOptions(
    options?.pageSizeOptions ?? pageSizeOptionsProp,
    pageSize,
  );

  const visiblePages = showPageNumbers
    ? getVisiblePages(page, pageCount, maxVisiblePages)
    : [];
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canChangePageSize =
    showPageSizeOptions && typeof onPageSizeChange === "function";

  const applyPageSize = (next: number) => {
    const clamped = clampPageSize(next, minPageSize, maxPageSize);
    if (clamped == null || clamped === pageSize) return;
    onPageSizeChange?.(clamped);
  };

  return (
    <div
      data-slot="table-pagination"
      style={style}
      className={cn(
        "flex flex-col gap-3 border-t border-black/[0.03] px-3 py-3 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {showTotal ? (
        <p className="text-sm text-muted-foreground">
          {locale.paginationShowing}{" "}
          <span className="tabular-nums font-medium text-foreground">
            {from}–{to}
          </span>{" "}
          {locale.paginationOf}{" "}
          <span className="tabular-nums font-medium text-foreground">
            {totalItems}
          </span>
        </p>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {canChangePageSize ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{rowsLabel}</span>
            <PageSizeCombobox
              pageSize={pageSize}
              options={pageSizeOptions}
              min={minPageSize}
              max={maxPageSize}
              allowCustom={allowCustomPageSize}
              radiusClass={radiusClass}
              onCommit={applyPageSize}
            />
          </div>
        ) : null}

        {(showPrevNext || showPageNumbers) && pageCount > 0 ? (
          <div className="flex items-center gap-0.5">
            {showPrevNext ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={locale.paginationPrevious}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className={cn("text-muted-foreground", radiusClass)}
              >
                <ChevronLeftIcon />
              </Button>
            ) : null}

            {visiblePages.map((item) => (
              <Button
                key={item}
                type="button"
                variant={item === page ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label={locale.paginationPageAria(item)}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  "tabular-nums",
                  item === page
                    ? "font-semibold shadow-sm"
                    : "text-muted-foreground",
                  radiusClass,
                )}
              >
                {item}
              </Button>
            ))}

            {showPrevNext ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={locale.paginationNext}
                disabled={page >= pageCount || pageCount === 0}
                onClick={() => onPageChange(page + 1)}
                className={cn("text-muted-foreground", radiusClass)}
              >
                <ChevronRightIcon />
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
