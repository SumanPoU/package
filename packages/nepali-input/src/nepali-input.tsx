"use client";

import * as React from "react";

import type { NepaliInputMode } from "./mappings";
import { cn, mergeRefs } from "./lib/utils";
import {
  createNepaliChangeHandler,
  useNepaliCaretRestore,
} from "./use-nepali-field";

const inputBase = cn(
  "itzsa-nepali-field",
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base",
  "transition-colors outline-none",
  "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  "placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
  "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

export type NepaliInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange"
> & {
  /** Keyboard layout. Defaults to `"unicode"`. */
  mode?: NepaliInputMode;
  /** When false, acts as a plain input. Defaults to `true`. */
  enabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export const NepaliInput = React.forwardRef<HTMLInputElement, NepaliInputProps>(
  function NepaliInput(
    {
      className,
      type = "text",
      mode = "unicode",
      enabled = true,
      onChange,
      onSelect,
      onKeyUp,
      onClick,
      autoComplete,
      spellCheck,
      lang,
      inputMode,
      ...props
    },
    forwardedRef,
  ) {
    const localRef = React.useRef<HTMLInputElement>(null);
    const setRefs = mergeRefs(forwardedRef, localRef);
    const { caretRef, captureCaret } = useNepaliCaretRestore(
      localRef,
      props.value,
      mode,
      enabled,
    );

    const handleChange = React.useMemo(
      () => createNepaliChangeHandler({ mode, enabled, caretRef }, onChange),
      [mode, enabled, onChange, caretRef],
    );

    return (
      <input
        type={type}
        data-slot="nepali-input"
        data-nepali-mode={mode}
        data-nepali-enabled={enabled ? "true" : "false"}
        ref={setRefs}
        className={cn(inputBase, className)}
        onChange={handleChange}
        onSelect={(event) => {
          captureCaret();
          onSelect?.(event);
        }}
        onKeyUp={(event) => {
          captureCaret();
          onKeyUp?.(event);
        }}
        onClick={(event) => {
          captureCaret();
          onClick?.(event);
        }}
        autoComplete={autoComplete ?? "off"}
        spellCheck={spellCheck ?? false}
        lang={lang ?? "ne"}
        inputMode={inputMode ?? "text"}
        {...props}
      />
    );
  },
);

NepaliInput.displayName = "NepaliInput";
