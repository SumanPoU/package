"use client";

import type { Device } from "@itzsa/page-builder";
import { Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact bordered select — same footprint as the Style panel `px` unit control. */
export function CompactSelect({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className,
  leading,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  "aria-label": string;
  className?: string;
  leading?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-6 items-center gap-0.5 rounded border border-gray-200 bg-white pl-1 pr-0.5 text-gray-600 shadow-sm",
        className,
      )}
    >
      {leading ? (
        <span className="flex shrink-0 text-gray-400" aria-hidden>
          {leading}
        </span>
      ) : null}
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className="h-5 max-w-[88px] cursor-pointer appearance-none border-0 bg-transparent py-0 pr-4 pl-0.5 text-[10px] font-medium text-gray-600 outline-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 2px center",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function LocaleSelect({
  value,
  onChange,
  locales,
  className,
}: {
  value: string;
  onChange: (locale: string) => void;
  locales: { code: string; label: string }[];
  className?: string;
}) {
  return (
    <CompactSelect
      className={className}
      value={value}
      onChange={onChange}
      aria-label="Content language"
      leading={<Globe className="h-3 w-3" />}
      options={locales.map((l) => ({
        value: l.code,
        label:
          l.code === "en"
            ? "ENG"
            : l.code === "ne"
              ? "NP"
              : l.code.toUpperCase(),
      }))}
    />
  );
}

const DEVICE_OPTIONS: { value: Device; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

export function DeviceSelect({
  value,
  onChange,
  className,
}: {
  value: Device;
  onChange: (device: Device) => void;
  className?: string;
}) {
  const Icon =
    value === "tablet" ? Tablet : value === "mobile" ? Smartphone : Monitor;
  return (
    <CompactSelect
      className={className}
      value={value}
      onChange={(v) => onChange(v as Device)}
      aria-label="Screen size"
      leading={<Icon className="h-3 w-3" />}
      options={DEVICE_OPTIONS}
    />
  );
}

export function UnitSelect({
  value,
  onChange,
  units = ["px", "rem", "%", "em"],
  "aria-label": ariaLabel = "Unit",
}: {
  value: string;
  onChange: (unit: string) => void;
  units?: string[];
  "aria-label"?: string;
}) {
  return (
    <CompactSelect
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      options={units.map((u) => ({ value: u, label: u }))}
    />
  );
}
