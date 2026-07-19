"use client";

import type { Locale, NamedEntity } from "@itzsa/nepal-geo-data";
import { displayName } from "@itzsa/nepal-geo-data";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./lib/utils";
import {
  mergeGeoStyle,
  type NepalGeoClassNames,
  type NepalGeoVars,
} from "./styling";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function usePortalReady() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);
  return ready;
}

export type GeoOption = NamedEntity & { meta?: string };

export type GeoSelectProps = {
  options: readonly GeoOption[];
  value?: number | null;
  onChange?: (id: number | null) => void;
  locale?: Locale;
  /** Visible field label above the trigger. */
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  id?: string;
  name?: string;
  className?: string;
  triggerClassName?: string;
  emptyLabel?: string;
  style?: React.CSSProperties;
  vars?: NepalGeoVars;
  classNames?: NepalGeoClassNames;
  "aria-label"?: string;
};

export function GeoSelect({
  options,
  value = null,
  onChange,
  locale = "en",
  label,
  placeholder = "Select…",
  searchPlaceholder,
  disabled = false,
  clearable = true,
  id,
  name,
  className,
  triggerClassName,
  emptyLabel,
  style,
  vars,
  classNames,
  "aria-label": ariaLabel,
}: GeoSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const portalReady = usePortalReady();
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 280 });

  const mergedStyle = mergeGeoStyle(vars, style);

  const selected = React.useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      return (
        o.nameEn.toLowerCase().includes(q) ||
        o.nameNe.includes(query.trim()) ||
        (o.meta?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [options, query]);

  const updatePos = React.useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let left = rect.left;
    const width = Math.max(rect.width, 240);
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    const below = rect.bottom + 4;
    const popH = 280;
    const top =
      below + popH > window.innerHeight && rect.top > popH
        ? rect.top - popH - 4
        : below;
    setPos({ top, left, width });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    updatePos();
    setQuery("");
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, updatePos]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const displayLabel = selected ? displayName(selected, locale) : "";

  const popover =
    open && portalReady
      ? createPortal(
          <div
            ref={popoverRef}
            className={cn("itzsa-geo-popover", classNames?.popover)}
            data-locale={locale}
            style={{
              ...mergedStyle,
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 50,
            }}
            role="listbox"
          >
            <div className="itzsa-geo-search-wrap">
              <input
                ref={searchRef}
                type="search"
                className={cn("itzsa-geo-search", classNames?.search)}
                value={query}
                placeholder={
                  searchPlaceholder ??
                  (locale === "ne" ? "खोज्नुहोस्…" : "Search…")
                }
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="itzsa-geo-options">
              {filtered.length === 0 ? (
                <p className={cn("itzsa-geo-empty", classNames?.empty)}>
                  {emptyLabel ?? (locale === "ne" ? "केही भेटिएन" : "No results")}
                </p>
              ) : (
                filtered.map((opt) => {
                  const active = opt.id === value;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "itzsa-geo-option",
                        active && "is-selected",
                        classNames?.option,
                      )}
                      onClick={() => {
                        onChange?.(opt.id);
                        setOpen(false);
                      }}
                    >
                      <span className="itzsa-geo-option-name">
                        {displayName(opt, locale)}
                      </span>
                      {opt.meta ? (
                        <span
                          className={cn(
                            "itzsa-geo-option-meta",
                            classNames?.optionMeta,
                          )}
                        >
                          {opt.meta}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
            {clearable && value != null ? (
              <div className="itzsa-geo-popover-footer">
                <button
                  type="button"
                  className={cn("itzsa-geo-clear", classNames?.clear)}
                  onClick={() => {
                    onChange?.(null);
                    setOpen(false);
                  }}
                >
                  {locale === "ne" ? "खाली" : "Clear"}
                </button>
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={cn("itzsa-geo", className, classNames?.root)}
      style={mergedStyle}
      data-locale={locale}
      data-disabled={disabled ? "" : undefined}
      data-open={open ? "" : undefined}
    >
      {label ? (
        <label
          className={cn("itzsa-geo-field-label", classNames?.label)}
          htmlFor={id}
        >
          {label}
        </label>
      ) : null}
      {name ? (
        <input type="hidden" name={name} value={value ?? ""} readOnly />
      ) : null}
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "itzsa-geo-trigger",
          triggerClassName,
          classNames?.trigger,
        )}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
      >
        <span
          className={cn(
            "itzsa-geo-trigger-label",
            !selected && "is-placeholder",
          )}
        >
          {displayLabel || placeholder}
        </span>
        <ChevronDown className="itzsa-geo-chevron" />
      </button>
      {popover}
    </div>
  );
}
