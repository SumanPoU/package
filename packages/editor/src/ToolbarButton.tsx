import {
  type ButtonHTMLAttributes,
  type FC,
  type ReactNode,
} from "react";

import { cn } from "./lib/utils";

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export const ToolbarButton: FC<ToolbarButtonProps> = ({
  active,
  children,
  className,
  ...props
}) => (
  <button
    type="button"
    aria-pressed={active || undefined}
    className={cn(
      "inline-flex size-8 items-center justify-center rounded-md transition-colors duration-100",
      "text-[var(--editor-muted)] hover:bg-[var(--editor-surface)] hover:text-[var(--editor-fg)]",
      "disabled:cursor-not-allowed disabled:opacity-30",
      active &&
        "bg-[var(--editor-accent)] text-[var(--editor-accent-fg)] hover:bg-[var(--editor-accent)] hover:text-[var(--editor-accent-fg)]",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export const ToolbarSeparator: FC = () => (
  <span className="mx-1 h-5 w-px shrink-0 bg-[var(--editor-border)]" />
);

export const ToolbarLabel: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="hidden shrink-0 select-none px-1 text-[10px] font-semibold tracking-widest text-[var(--editor-muted-fg)] uppercase lg:inline">
    {children}
  </span>
);
