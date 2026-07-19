"use client";

import * as React from "react";

import { cn } from "./lib/utils";

export type CellContentProps = {
  children: React.ReactNode;
  wrap?: boolean;
  truncate?: boolean;
  /** Native tooltip when truncated (full text). */
  title?: string;
  className?: string;
};

/**
 * Renders cell/header text with optional wrap or ellipsis truncate.
 * Truncate uses overflow hidden + text-ellipsis + nowrap (…).
 */
export function CellContent({
  children,
  wrap = false,
  truncate = true,
  title,
  className,
}: CellContentProps) {
  if (wrap) {
    return (
      <div className={cn("min-w-0 whitespace-normal break-words", className)}>
        {children}
      </div>
    );
  }

  if (truncate) {
    const textTitle =
      title ??
      (typeof children === "string" || typeof children === "number"
        ? String(children)
        : undefined);

    return (
      <div
        className={cn("min-w-0 max-w-full truncate", className)}
        title={textTitle}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn("min-w-0 whitespace-nowrap", className)}>{children}</div>
  );
}
