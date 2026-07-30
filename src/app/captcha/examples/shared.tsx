"use client";

import type { ReactNode } from "react";

export function ExampleShell({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function ExampleToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">{children}</div>
  );
}

export function ExampleStatus({
  verified,
  validateOk,
}: {
  verified: boolean;
  validateOk: boolean;
}) {
  return (
    <p className="mt-3 break-words text-sm leading-relaxed text-secondary [overflow-wrap:anywhere]">
      <span className="text-tertiary">onVerified</span>
      {" → "}
      <span className="font-medium text-primary">
        {verified ? "true" : "false"}
      </span>
      <span className="text-tertiary">{" · "}</span>
      <span className="text-tertiary">validate()</span>
      {" → "}
      <span className="font-medium text-primary">
        {validateOk ? "true" : "false"}
      </span>
    </p>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1 text-xs text-secondary transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function SegmentedControl<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: {
  ariaLabel: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <fieldset
      aria-label={ariaLabel}
      className="flex flex-wrap rounded-md border-[0.5px] border-border bg-card p-0.5"
    >
      {options.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`rounded-sm px-2.5 py-1 text-xs transition-colors ${
            value === m.id
              ? "bg-muted font-medium text-primary"
              : "text-secondary hover:text-primary"
          }`}
        >
          {m.label}
        </button>
      ))}
    </fieldset>
  );
}
