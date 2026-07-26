import type * as React from "react";

import { cn } from "../../lib/utils";

/**
 * Lightweight input primitive — ships under `components/itzsa/captcha/components/ui`
 * when installed from the registry (same role as shadcn `components/ui`).
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      data-itzsa-captcha-input=""
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-border bg-transparent px-3 py-1 text-sm text-primary shadow-xs outline-none transition-[color,box-shadow]",
        "placeholder:text-secondary/50",
        "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/30",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
