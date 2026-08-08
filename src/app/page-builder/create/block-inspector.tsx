"use client";

import {
  type Block,
  type BlockRegistry,
  type BlockStyle,
  type Device,
  type DimValue,
  getBlockStyle,
  type LocaleConfig,
  type LocaleDefinition,
  type SpacingBox,
} from "@itzsa/page-builder";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalSpaceAround,
  AlignVerticalSpaceBetween,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Link2,
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
  Unlink2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import { BlockCodePanel } from "./code-panel";
import { CustomScriptEditor } from "./custom-script-editor";
import { DeviceSelect, LocaleSelect, UnitSelect } from "./inspector-controls";

type PanelTab = "content" | "style" | "advanced";

/** Shared chip / toggle selected state — theme accent, not hardcoded blue. */
const chipSelected =
  "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_20%,transparent)]";
const chipIdle =
  "border-border text-muted-foreground hover:bg-muted hover:text-foreground";
const fieldInput =
  "h-7 w-full rounded border border-border bg-card px-2 text-[11px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent/25";

export type BlockInspectorProps = {
  block: Block;
  registry: BlockRegistry;
  locale: string;
  locales: LocaleDefinition[];
  localeConfig: LocaleConfig;
  device: Device;
  onDeviceChange: (device: Device) => void;
  onLocaleChange: (locale: string) => void;
  onBack: () => void;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void;
  allowCustomCss?: boolean;
  allowCustomJs?: boolean;
  allowDataBinding?: boolean;
};

const emptySpacing = (): SpacingBox => ({
  t: "",
  r: "",
  b: "",
  l: "",
  unit: "px",
  linked: true,
});

const Section = ({
  title,
  children,
  defaultOpen = true,
  alt = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Alternating zebra background for Style rows */
  alt?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn(
        "border-b border-gray-100",
        alt ? "bg-[#f6f7f9]" : "bg-white",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase hover:bg-black/[0.02]"
      >
        {title}
        <span className="text-gray-300">{open ? "▾" : "▸"}</span>
      </button>
      {open ? <div className="space-y-4 px-3 pb-3">{children}</div> : null}
    </div>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
    {children}
  </div>
);

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1.5">
    <FieldLabel>{label}</FieldLabel>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value && /^#/.test(value) ? value.slice(0, 7) : "#ffffff"}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-border bg-card p-0.5"
      />
      <input
        value={value ?? ""}
        placeholder="#000000"
        onChange={(e) => onChange(e.target.value)}
        className={cn(fieldInput, "flex-1 font-mono")}
      />
      {value ? (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          onClick={() => onChange("")}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      ) : null}
    </div>
  </div>
);

const nudgeNumericString = (raw: string, delta: number): string => {
  const trimmed = raw.trim();
  const base =
    trimmed === "" || trimmed === "—" ? 0 : Number.parseFloat(trimmed);
  if (!Number.isFinite(base)) return raw;
  const next = base + delta;
  return Number.isInteger(next)
    ? String(next)
    : String(Math.round(next * 100) / 100);
};

const DimField = ({
  label,
  value,
  onChange,
  device,
  onDeviceChange,
  units = ["px", "%", "rem", "vw", "auto"],
}: {
  label: string;
  value?: DimValue;
  onChange: (v: DimValue) => void;
  device?: Device;
  onDeviceChange?: (device: Device) => void;
  units?: DimValue["unit"][];
}) => {
  const dim = value ?? { value: "", unit: "px" };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (dim.unit === "auto") return;
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    onChange({
      ...dim,
      value: nudgeNumericString(dim.value ?? "", delta),
    });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        {device && onDeviceChange ? (
          <DeviceSelect value={device} onChange={onDeviceChange} />
        ) : null}
      </div>
      <div className="flex gap-1">
        <input
          value={dim.unit === "auto" ? "" : (dim.value ?? "")}
          disabled={dim.unit === "auto"}
          placeholder={dim.unit === "auto" ? "auto" : "—"}
          inputMode="decimal"
          aria-label={label}
          onChange={(e) => onChange({ ...dim, value: e.target.value })}
          onKeyDown={handleKeyDown}
          className={cn(
            fieldInput,
            "flex-1 disabled:bg-muted disabled:opacity-70",
          )}
        />
        <select
          value={dim.unit ?? "px"}
          aria-label={`${label} unit`}
          onChange={(e) =>
            onChange({
              ...dim,
              unit: e.target.value as DimValue["unit"],
            })
          }
          className="h-7 rounded border border-border bg-card px-1 text-[10px] text-foreground outline-none focus:border-accent"
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const IconToggle = ({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "flex h-7 w-7 items-center justify-center rounded border transition-colors",
      active ? chipSelected : chipIdle,
    )}
  >
    {children}
  </button>
);

const FourDimInput = ({
  label,
  value,
  onChange,
  device,
  onDeviceChange,
}: {
  label: string;
  value: SpacingBox;
  onChange: (v: SpacingBox) => void;
  device: Device;
  onDeviceChange: (device: Device) => void;
}) => {
  const box = { ...emptySpacing(), ...value };
  const setSide = (side: "t" | "r" | "b" | "l", raw: string) => {
    const next = { ...box, [side]: raw };
    if (box.linked) {
      next.t = raw;
      next.r = raw;
      next.b = raw;
      next.l = raw;
    }
    onChange(next);
  };

  const handleSideKeyDown = (
    side: "t" | "r" | "b" | "l",
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : 1;
    const delta = e.key === "ArrowUp" ? step : -step;
    setSide(side, nudgeNumericString(box[side] ?? "", delta));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex items-center gap-1">
          <DeviceSelect value={device} onChange={onDeviceChange} />
          <UnitSelect
            value={box.unit ?? "px"}
            aria-label={`${label} unit`}
            onChange={(unit) =>
              onChange({
                ...box,
                unit: unit as SpacingBox["unit"],
              })
            }
          />
          <button
            type="button"
            aria-label={box.linked ? "Unlink sides" : "Link sides"}
            onClick={() => onChange({ ...box, linked: !box.linked })}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded border transition-colors",
              box.linked ? chipSelected : chipIdle,
            )}
          >
            {box.linked ? (
              <Link2 className="h-3 w-3" />
            ) : (
              <Unlink2 className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(["t", "r", "b", "l"] as const).map((side) => (
          <div key={side} className="space-y-0.5">
            <input
              value={box[side] === "—" ? "" : (box[side] ?? "")}
              placeholder="—"
              inputMode="decimal"
              aria-label={`${label} ${side}`}
              onChange={(e) => setSide(side, e.target.value)}
              onKeyDown={(e) => handleSideKeyDown(side, e)}
              className={cn(fieldInput, "px-1 text-center")}
            />
            <div className="text-center text-[9px] text-muted-foreground uppercase">
              {side}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function BlockInspector({
  block,
  registry,
  locale,
  locales,
  localeConfig,
  device,
  onDeviceChange,
  onLocaleChange,
  onBack,
  onChange,
  onRemove,
  allowCustomCss = true,
  allowCustomJs = true,
  allowDataBinding = true,
}: BlockInspectorProps) {
  const [tab, setTab] = useState<PanelTab>("content");
  const def = registry.get(block.type);
  const ContentFields = def?.ContentFields;
  const isFlexish =
    block.type === "flex" || block.type === "container" || block.type === "box";

  const styleDevice = device;
  const activeStyle = useMemo((): BlockStyle => {
    const base = getBlockStyle(block);
    if (styleDevice === "desktop") return base;
    const override = block.responsiveStyle?.[styleDevice] as
      | BlockStyle
      | undefined;
    return override ? { ...base, ...override } : base;
  }, [block, styleDevice]);

  const patchStyle = (patch: Partial<BlockStyle>) => {
    if (styleDevice === "desktop") {
      onChange({ style: { ...getBlockStyle(block), ...patch } });
      return;
    }
    const existing =
      (block.responsiveStyle?.[styleDevice] as BlockStyle | undefined) ?? {};
    onChange({
      responsiveStyle: {
        ...(block.responsiveStyle ?? {}),
        [styleDevice]: { ...existing, ...patch },
      },
    });
  };

  const hiddenDevices = block.visibility?.hiddenDevices ?? [];
  const hiddenLocales = block.visibility?.hiddenLocales ?? [];
  const toggleVisibility = (d: Device) => {
    const next = hiddenDevices.includes(d)
      ? hiddenDevices.filter((x) => x !== d)
      : [...hiddenDevices, d];
    onChange({
      visibility: { ...(block.visibility ?? {}), hiddenDevices: next },
    });
  };
  const toggleHiddenLocale = (code: string) => {
    const next = hiddenLocales.includes(code)
      ? hiddenLocales.filter((x) => x !== code)
      : [...hiddenLocales, code];
    onChange({
      visibility: {
        ...(block.visibility ?? {}),
        hiddenLocales: next.length ? next : undefined,
      },
    });
  };
  const patchVisibilityFlag = (
    key: "hiddenOnCanvas" | "hiddenOnPublish",
    value: boolean,
  ) => {
    onChange({
      visibility: {
        ...(block.visibility ?? {}),
        [key]: value || undefined,
      },
    });
  };
  const requireLoggedIn = Boolean(
    block.visibleWhen?.allOf?.some(
      (p) => p.key === "auth.isLoggedIn" && p.equals === true,
    ),
  );
  const toggleRequireLoggedIn = () => {
    if (requireLoggedIn) {
      const allOf = (block.visibleWhen?.allOf ?? []).filter(
        (p) => !(p.key === "auth.isLoggedIn" && p.equals === true),
      );
      onChange({
        visibleWhen:
          allOf.length || block.visibleWhen?.anyOf?.length
            ? { ...block.visibleWhen, allOf: allOf.length ? allOf : undefined }
            : undefined,
      });
      return;
    }
    onChange({
      visibleWhen: {
        ...block.visibleWhen,
        allOf: [
          ...(block.visibleWhen?.allOf ?? []),
          { key: "auth.isLoggedIn", equals: true },
        ],
      },
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50 px-2.5 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to elements"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-white hover:text-gray-700 hover:shadow-sm"
        >
          ←
        </button>
        <span className="text-[13px] font-semibold tracking-tight text-gray-800 capitalize">
          {def?.label ?? block.type}
        </span>
      </div>

      <div className="border-b border-gray-100 px-2.5 pt-2 pb-2">
        <div className="grid h-8 w-full grid-cols-3 gap-0.5 rounded-lg bg-gray-100/80 p-1">
          {(["content", "style", "advanced"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "h-6 rounded-md text-[11px] font-medium capitalize",
                tab === id
                  ? "bg-card text-accent shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "content" ? (
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] tracking-wide text-gray-400 uppercase">
                Language
              </span>
              <LocaleSelect
                value={locale}
                onChange={onLocaleChange}
                locales={locales}
              />
            </div>
            {ContentFields &&
            !(block.type === "repeater" && !allowDataBinding) ? (
              <div className="pb-host-content-fields space-y-3 text-[12px] [&_.pb-media-row_input]:h-8 [&_.pb-media-row_input]:w-auto [&_.pb-media-row_input]:min-w-0 [&_.pb-media-row_input]:flex-1 [&_.pb-media-upload]:h-8 [&_input[type=text]]:h-8 [&_input[type=text]]:w-full [&_input[type=text]]:rounded [&_input[type=text]]:border [&_input[type=text]]:border-gray-200 [&_input[type=text]]:px-2 [&_input[type=url]]:h-8 [&_input[type=url]]:w-full [&_input[type=url]]:rounded [&_input[type=url]]:border [&_input[type=url]]:border-gray-200 [&_input[type=url]]:px-2 [&_select]:h-8 [&_select]:w-full [&_select]:rounded [&_select]:border [&_select]:border-gray-200 [&_textarea]:w-full [&_textarea]:rounded [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:px-2 [&_textarea]:py-1">
                <ContentFields
                  block={block}
                  locale={locale}
                  onChange={onChange}
                />
              </div>
            ) : block.type === "repeater" && !allowDataBinding ? (
              <p className="text-[11px] text-gray-400">
                Data binding is disabled for this workspace.
              </p>
            ) : (
              <p className="text-[11px] text-gray-400">
                No content fields for this block type.
              </p>
            )}
          </div>
        ) : null}

        {tab === "style" ? (
          <div>
            <Section title="Layout">
              <div className="space-y-1.5">
                <FieldLabel>Align</FieldLabel>
                <div className="flex gap-1">
                  {(
                    [
                      ["left", AlignLeft],
                      ["center", AlignCenter],
                      ["right", AlignRight],
                    ] as const
                  ).map(([a, Icon]) => (
                    <IconToggle
                      key={a}
                      label={`Align ${a}`}
                      active={activeStyle.align === a}
                      onClick={() => patchStyle({ align: a })}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </IconToggle>
                  ))}
                </div>
              </div>

              <FourDimInput
                label="Margin"
                value={activeStyle.margin ?? emptySpacing()}
                onChange={(margin) => patchStyle({ margin })}
                device={styleDevice}
                onDeviceChange={onDeviceChange}
              />
              <FourDimInput
                label="Padding"
                value={activeStyle.padding ?? emptySpacing()}
                onChange={(padding) => patchStyle({ padding })}
                device={styleDevice}
                onDeviceChange={onDeviceChange}
              />

              <div className="space-y-1.5">
                <FieldLabel>Padding preset</FieldLabel>
                <div className="grid grid-cols-4 gap-1">
                  {(["none", "sm", "md", "lg"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => patchStyle({ paddingY: p })}
                      className={cn(
                        "rounded border py-1 text-[11px] capitalize transition-colors",
                        (activeStyle.paddingY ?? "none") === p
                          ? chipSelected
                          : chipIdle,
                      )}
                    >
                      {p === "none" ? "None" : p}
                    </button>
                  ))}
                </div>
              </div>

              {isFlexish ? (
                <div className="space-y-4 border-t border-gray-100 pt-3">
                  <div className="space-y-1.5">
                    <FieldLabel>Container width</FieldLabel>
                    <div className="grid grid-cols-2 gap-1">
                      {(
                        [
                          ["full", "Full"],
                          ["boxed", "Boxed"],
                        ] as const
                      ).map(([w, label]) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => patchStyle({ widthMode: w })}
                          className={cn(
                            "rounded border py-1.5 text-[11px] transition-colors",
                            activeStyle.widthMode === w
                              ? chipSelected
                              : chipIdle,
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {activeStyle.widthMode === "boxed" ? (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-gray-400">
                            Content width
                          </span>
                          <span className="font-mono text-[11px] text-gray-600">
                            {(() => {
                              const raw =
                                activeStyle.boxedMaxWidth?.trim() || "1140px";
                              const n = Number.parseInt(raw, 10);
                              return Number.isFinite(n) ? `${n}px` : "1140px";
                            })()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={320}
                          max={1600}
                          step={10}
                          value={(() => {
                            const raw =
                              activeStyle.boxedMaxWidth?.trim() || "1140px";
                            const n = Number.parseInt(raw, 10);
                            return Number.isFinite(n) ? n : 1140;
                          })()}
                          aria-label="Boxed content width"
                          onChange={(e) =>
                            patchStyle({
                              boxedMaxWidth: `${e.target.value}px`,
                            })
                          }
                          className="w-full accent-accent"
                        />
                        <div className="flex gap-1">
                          <input
                            value={
                              activeStyle.boxedMaxWidth?.replace(/px$/i, "") ??
                              "1140"
                            }
                            inputMode="numeric"
                            aria-label="Boxed max width value"
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              patchStyle({
                                boxedMaxWidth: digits
                                  ? `${digits}px`
                                  : "1140px",
                              });
                            }}
                            className="h-7 flex-1 rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
                          />
                          <span className="inline-flex h-7 items-center rounded border border-gray-200 px-2 text-[10px] font-medium text-gray-500">
                            px
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <FieldLabel>Flex direction</FieldLabel>
                    <div className="flex gap-1">
                      {(
                        [
                          ["row", ArrowRight],
                          ["column", ArrowDown],
                          ["row-reverse", ArrowLeft],
                          ["column-reverse", ArrowUp],
                        ] as const
                      ).map(([d, Icon]) => (
                        <IconToggle
                          key={d}
                          label={d}
                          active={activeStyle.flexDirection === d}
                          onClick={() => patchStyle({ flexDirection: d })}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </IconToggle>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Justify content</FieldLabel>
                    <div className="flex flex-wrap gap-1">
                      {(
                        [
                          ["flex-start", AlignLeft],
                          ["center", AlignCenter],
                          ["flex-end", AlignRight],
                          ["space-between", AlignVerticalSpaceBetween],
                          ["space-around", AlignVerticalSpaceAround],
                          ["space-evenly", AlignVerticalJustifyCenter],
                        ] as const
                      ).map(([j, Icon]) => (
                        <IconToggle
                          key={j}
                          label={j}
                          active={activeStyle.justifyContent === j}
                          onClick={() => patchStyle({ justifyContent: j })}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </IconToggle>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Align items</FieldLabel>
                    <div className="flex gap-1">
                      {(
                        [
                          ["stretch", AlignVerticalJustifyStart],
                          ["flex-start", AlignVerticalJustifyStart],
                          ["center", AlignVerticalJustifyCenter],
                          ["flex-end", AlignVerticalJustifyEnd],
                        ] as const
                      ).map(([a, Icon]) => (
                        <IconToggle
                          key={a}
                          label={a}
                          active={activeStyle.alignItems === a}
                          onClick={() => patchStyle({ alignItems: a })}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </IconToggle>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <FieldLabel>Gap</FieldLabel>
                    <input
                      value={activeStyle.gap ?? ""}
                      placeholder="e.g. 16px"
                      aria-label="Gap"
                      onChange={(e) => patchStyle({ gap: e.target.value })}
                      className="h-7 w-full rounded border border-border bg-card px-2 text-[11px] outline-none focus:border-accent focus:ring-1 focus:ring-accent/25"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 border-t border-border pt-3">
                <DimField
                  label="Width"
                  value={activeStyle.width}
                  onChange={(width) => patchStyle({ width })}
                  device={styleDevice}
                  onDeviceChange={onDeviceChange}
                  units={["px", "%", "vw", "auto"]}
                />
                <DimField
                  label="Height"
                  value={activeStyle.height}
                  onChange={(height) => patchStyle({ height })}
                  device={styleDevice}
                  onDeviceChange={onDeviceChange}
                  units={["px", "%", "vh", "auto"]}
                />
                <DimField
                  label="Min height"
                  value={activeStyle.minHeight}
                  onChange={(minHeight) => patchStyle({ minHeight })}
                  device={styleDevice}
                  onDeviceChange={onDeviceChange}
                  units={["px", "%", "vh", "auto"]}
                />
              </div>
            </Section>

            <Section title="Typography" alt>
              <div className="space-y-1.5">
                <FieldLabel>Font family</FieldLabel>
                <select
                  value={activeStyle.fontFamily ?? ""}
                  aria-label="Font family"
                  onChange={(e) =>
                    patchStyle({ fontFamily: e.target.value || undefined })
                  }
                  className="h-8 w-full rounded border border-gray-200 px-2 text-[11px]"
                >
                  <option value="">Default (System)</option>
                  <option value="ui-sans-serif, system-ui, sans-serif">
                    Sans
                  </option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="ui-monospace, monospace">Monospace</option>
                  <option value="'Times New Roman', Times, serif">Times</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel>Font size</FieldLabel>
                  <DeviceSelect value={styleDevice} onChange={onDeviceChange} />
                </div>
                <div className="flex gap-1">
                  <input
                    value={activeStyle.fontSize ?? ""}
                    placeholder="inherit"
                    inputMode="decimal"
                    aria-label="Font size"
                    onChange={(e) => patchStyle({ fontSize: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                      e.preventDefault();
                      const step = e.shiftKey ? 10 : 1;
                      const delta = e.key === "ArrowUp" ? step : -step;
                      patchStyle({
                        fontSize: nudgeNumericString(
                          activeStyle.fontSize ?? "",
                          delta,
                        ),
                      });
                    }}
                    className={cn(fieldInput, "flex-1")}
                  />
                  <select
                    value={activeStyle.fontSizeUnit ?? "px"}
                    aria-label="Font size unit"
                    onChange={(e) =>
                      patchStyle({ fontSizeUnit: e.target.value })
                    }
                    className="h-7 rounded border border-border bg-card px-1 text-[10px] outline-none focus:border-accent"
                  >
                    {["px", "rem", "em", "%"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Font weight</FieldLabel>
                <div className="grid grid-cols-5 gap-1">
                  {(
                    [
                      ["100", "100"],
                      ["200", "200"],
                      ["300", "300"],
                      ["400", "400"],
                      ["500", "500"],
                      ["600", "600"],
                      ["700", "700"],
                      ["800", "800"],
                      ["900", "900"],
                    ] as const
                  ).map(([id, label]) => {
                    const aliases: Record<string, string> = {
                      thin: "300",
                      reg: "400",
                      semi: "600",
                      bold: "700",
                    };
                    const current =
                      aliases[activeStyle.fontWeight ?? ""] ??
                      activeStyle.fontWeight;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => patchStyle({ fontWeight: id })}
                        className={cn(
                          "rounded border py-1 font-mono text-[10px] transition-colors",
                          current === id ? chipSelected : chipIdle,
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <FieldLabel>Line height</FieldLabel>
                  <input
                    value={activeStyle.lineHeight ?? ""}
                    placeholder="1.5"
                    aria-label="Line height"
                    onChange={(e) => patchStyle({ lineHeight: e.target.value })}
                    className="h-7 w-full rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Letter spacing</FieldLabel>
                  <input
                    value={activeStyle.letterSpacing ?? ""}
                    placeholder="0px"
                    aria-label="Letter spacing"
                    onChange={(e) =>
                      patchStyle({ letterSpacing: e.target.value })
                    }
                    className="h-7 w-full rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Transform</FieldLabel>
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      ["none", "Aa"],
                      ["uppercase", "AA"],
                      ["lowercase", "aa"],
                      ["capitalize", "Aa"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => patchStyle({ textTransform: id })}
                      className={cn(
                        "rounded border py-1 text-[11px] transition-colors",
                        (activeStyle.textTransform ?? "none") === id
                          ? chipSelected
                          : chipIdle,
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <ColorField
                label="Text color"
                value={activeStyle.textColor}
                onChange={(textColor) => patchStyle({ textColor })}
              />
            </Section>

            <Section title="Background">
              <div className="space-y-1.5">
                <FieldLabel>Preset</FieldLabel>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      ["none", "None", "bg-white border border-gray-200"],
                      ["gray", "Gray", "bg-gray-100"],
                      ["dark", "Dark", "bg-gray-800"],
                    ] as const
                  ).map(([id, label, swatch]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        patchStyle({
                          bg: id,
                          backgroundColor: undefined,
                        })
                      }
                      className={cn(
                        "flex flex-col items-center gap-1 rounded border py-2 text-[11px] transition-colors",
                        activeStyle.bg === id && !activeStyle.backgroundColor
                          ? chipSelected
                          : chipIdle,
                      )}
                    >
                      <span className={cn("h-3 w-6 rounded", swatch)} />
                      <span className="text-gray-500">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <ColorField
                label="Custom color"
                value={activeStyle.backgroundColor}
                onChange={(backgroundColor) =>
                  patchStyle({
                    backgroundColor,
                    bg: backgroundColor ? "none" : activeStyle.bg,
                  })
                }
              />
            </Section>

            <Section title="Border" alt>
              <div className="space-y-1.5">
                <FieldLabel>Style</FieldLabel>
                <div className="flex flex-wrap gap-1">
                  {(
                    ["none", "solid", "dashed", "dotted", "double"] as const
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => patchStyle({ borderStyle: st })}
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] capitalize transition-colors",
                        (activeStyle.borderStyle ?? "none") === st
                          ? chipSelected
                          : chipIdle,
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              {(activeStyle.borderStyle ?? "none") !== "none" ? (
                <>
                  <div className="space-y-1.5">
                    <FieldLabel>Width</FieldLabel>
                    <input
                      value={activeStyle.borderWidth ?? ""}
                      placeholder="1px"
                      aria-label="Border width"
                      onChange={(e) =>
                        patchStyle({ borderWidth: e.target.value })
                      }
                      className={fieldInput}
                    />
                  </div>
                  <ColorField
                    label="Color"
                    value={activeStyle.borderColor}
                    onChange={(borderColor) => patchStyle({ borderColor })}
                  />
                </>
              ) : null}
              <div className="space-y-1.5">
                <FieldLabel>Radius</FieldLabel>
                <input
                  value={activeStyle.borderRadius ?? ""}
                  placeholder="0px"
                  aria-label="Border radius"
                  onChange={(e) => patchStyle({ borderRadius: e.target.value })}
                  className={fieldInput}
                />
              </div>
            </Section>

            <Section title="Effects" defaultOpen={false}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel>Opacity</FieldLabel>
                  <span className="font-mono text-[11px] text-gray-500">
                    {activeStyle.opacity !== undefined &&
                    activeStyle.opacity !== ""
                      ? `${activeStyle.opacity}%`
                      : "100%"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={
                    activeStyle.opacity !== undefined &&
                    activeStyle.opacity !== ""
                      ? activeStyle.opacity
                      : "100"
                  }
                  aria-label="Opacity"
                  onChange={(e) =>
                    patchStyle({
                      opacity: e.target.value === "100" ? "" : e.target.value,
                    })
                  }
                  className="w-full accent-accent"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Box shadow</FieldLabel>
                <div className="grid grid-cols-2 gap-1">
                  {(
                    [
                      ["", "None"],
                      ["0 1px 2px rgb(0 0 0 / 8%)", "Soft"],
                      ["0 4px 12px rgb(0 0 0 / 12%)", "Medium"],
                      ["0 10px 30px rgb(0 0 0 / 18%)", "Strong"],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => patchStyle({ boxShadow: val })}
                      className={cn(
                        "rounded border py-1.5 text-[11px] transition-colors",
                        (activeStyle.boxShadow ?? "") === val
                          ? chipSelected
                          : chipIdle,
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        ) : null}

        {tab === "advanced" ? (
          <div>
            <Section title="CSS ID / Classes">
              <p className="text-[11px] text-gray-500 italic">
                You can use your custom css id or classes from here.
              </p>
              {allowCustomCss ? (
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-gray-500">CSS ID</span>
                    <input
                      type="text"
                      value={getBlockStyle(block).cssId ?? ""}
                      aria-label="CSS ID"
                      onChange={(e) =>
                        onChange({
                          style: {
                            ...getBlockStyle(block),
                            cssId: e.target.value.trim() || undefined,
                          },
                        })
                      }
                      className="h-8 w-full max-w-[11rem] rounded border border-gray-200 px-2 text-[12px] outline-none focus:border-accent focus:ring-1 focus:ring-accent/25"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-gray-500">CSS Classes</span>
                    <input
                      type="text"
                      value={getBlockStyle(block).cssClasses ?? ""}
                      aria-label="CSS Classes"
                      placeholder="my-class another-class"
                      onChange={(e) =>
                        onChange({
                          style: {
                            ...getBlockStyle(block),
                            cssClasses: e.target.value.trim() || undefined,
                          },
                        })
                      }
                      className="h-8 w-full max-w-[11rem] rounded border border-gray-200 px-2 text-[12px] outline-none focus:border-accent focus:ring-1 focus:ring-accent/25"
                    />
                  </label>
                </>
              ) : (
                <p className="text-[11px] text-gray-400">
                  Custom CSS classes are disabled for this workspace.
                </p>
              )}
            </Section>

            <Section title="Visibility" alt>
              <div className="flex gap-1.5">
                {(
                  [
                    ["desktop", Monitor],
                    ["tablet", Tablet],
                    ["mobile", Smartphone],
                  ] as const
                ).map(([d, Icon]) => {
                  const visible = !hiddenDevices.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      title={visible ? "Always visible" : "Hidden"}
                      aria-pressed={visible}
                      onClick={() => toggleVisibility(d)}
                      className={cn(
                        "flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] transition-colors",
                        visible
                          ? "border-accent/40 bg-card text-foreground"
                          : "border-dashed border-gray-200 bg-gray-50 text-gray-300 line-through",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="capitalize">{d}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input
                    type="checkbox"
                    className="pb-check"
                    checked={Boolean(block.visibility?.hiddenOnCanvas)}
                    onChange={(e) =>
                      patchVisibilityFlag("hiddenOnCanvas", e.target.checked)
                    }
                  />
                  Hide on canvas (ghost)
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input
                    type="checkbox"
                    className="pb-check"
                    checked={Boolean(block.visibility?.hiddenOnPublish)}
                    onChange={(e) =>
                      patchVisibilityFlag("hiddenOnPublish", e.target.checked)
                    }
                  />
                  Hide on Preview / Open
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gray-600">
                  <input
                    type="checkbox"
                    className="pb-check"
                    checked={requireLoggedIn}
                    onChange={toggleRequireLoggedIn}
                  />
                  Only when logged in
                </label>
              </div>

              {locales.length > 1 ? (
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[11px] text-gray-500">
                    Hide for locales
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {locales.map((loc) => {
                      const hidden = hiddenLocales.includes(loc.code);
                      return (
                        <button
                          key={loc.code}
                          type="button"
                          aria-pressed={hidden}
                          title={
                            hidden
                              ? `Hidden for ${loc.label}`
                              : `Visible for ${loc.label}`
                          }
                          onClick={() => toggleHiddenLocale(loc.code)}
                          className={cn(
                            "rounded border px-2 py-1 text-[11px] transition-colors",
                            hidden
                              ? "border-dashed border-gray-200 bg-gray-50 text-gray-300 line-through"
                              : "border-accent/40 bg-card text-foreground",
                          )}
                        >
                          {loc.code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </Section>

            {allowCustomCss ? (
            <Section title="Custom CSS">
              <div className="overflow-hidden rounded border border-gray-800 bg-gray-900">
                <div className="px-2.5 py-1 font-mono text-[10px] text-gray-400">
                  <span className="text-accent">.b-{block.id}</span>
                  <span className="text-gray-500"> {"{"}</span>
                </div>
                <textarea
                  value={block.customCss ?? ""}
                  onChange={(e) => onChange({ customCss: e.target.value })}
                  placeholder={
                    "color: red;\nmargin-top: 20px;\n/* declarations only – or use .element { ... } */"
                  }
                  rows={7}
                  spellCheck={false}
                  aria-label="Custom CSS"
                  className="w-full resize-y border-0 bg-gray-900 px-2.5 py-1 font-mono text-[11px] text-green-400 outline-none placeholder:text-gray-600"
                />
                <div className="px-2.5 py-1 font-mono text-[10px] text-gray-500">
                  {"}"}
                </div>
              </div>
              <p className="text-[10px] leading-relaxed text-gray-500">
                Enter CSS declarations only, or a full rule using{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5">
                  .element
                </code>{" "}
                as a shortcut for{" "}
                <code className="inline-block max-w-full break-all rounded bg-gray-100 px-1 py-0.5">
                  .b-{block.id}
                </code>
                .
              </p>
            </Section>
            ) : null}

            {allowCustomJs ? (
            <Section title="Custom JS" defaultOpen={false}>
              <CustomScriptEditor
                value={block.customJs}
                onChange={(customJs) => onChange({ customJs })}
                ariaLabel="Block custom JavaScript"
                hint="Runs on Preview / Open Page for this block’s page (composePageJs). Not injected into the editor canvas."
                minRows={8}
              />
            </Section>
            ) : null}

            <Section title="Code" defaultOpen={false}>
              <BlockCodePanel
                block={block}
                registry={registry}
                localeConfig={localeConfig}
                locale={locale}
              />
            </Section>
          </div>
        ) : null}
      </div>

      <div className="border-t border-gray-100 p-2">
        <button
          type="button"
          onClick={onRemove}
          className="flex w-full items-center justify-center gap-1.5 rounded border border-gray-100 py-1.5 text-[11px] text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" /> Delete block
        </button>
      </div>
    </div>
  );
}
