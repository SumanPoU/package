import { cn } from "./lib/utils";

/** Shared compact select-like trigger for toolbar controls (Columns, Density, etc.). */
export const toolbarSelectTriggerClass = cn(
  "inline-flex h-7 w-fit items-center justify-between gap-1.5 border border-input bg-transparent px-2 text-xs font-normal text-foreground shadow-none",
  "whitespace-nowrap outline-none transition-[color,box-shadow]",
  "hover:bg-muted/50",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:opacity-50",
);
