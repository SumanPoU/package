"use client";

import * as React from "react";
import { cn, mergeRefs } from "./lib/utils";
import type { NepaliInputMode } from "./mappings";
import {
  createNepaliChangeHandler,
  useNepaliCaretRestore,
} from "./use-nepali-field";

const textareaBase = cn(
  "itzsa-nepali-field",
  "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base",
  "transition-colors outline-none",
  "placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
  "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

export type NepaliTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "onChange"
> & {
  /** Keyboard layout. Defaults to `"unicode"`. */
  mode?: NepaliInputMode;
  /** When false, acts as a plain textarea. Defaults to `true`. */
  enabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
};

export const NepaliTextarea = React.forwardRef<
  HTMLTextAreaElement,
  NepaliTextareaProps
>(function NepaliTextarea(
  {
    className,
    mode = "unicode",
    enabled = true,
    onChange,
    onSelect,
    onKeyUp,
    onClick,
    spellCheck,
    lang,
    ...props
  },
  forwardedRef,
) {
  const localRef = React.useRef<HTMLTextAreaElement>(null);
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
    <textarea
      data-slot="nepali-textarea"
      data-nepali-mode={mode}
      data-nepali-enabled={enabled ? "true" : "false"}
      ref={setRefs}
      className={cn(textareaBase, className)}
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
      spellCheck={spellCheck ?? false}
      lang={lang ?? "ne"}
      {...props}
    />
  );
});

NepaliTextarea.displayName = "NepaliTextarea";
