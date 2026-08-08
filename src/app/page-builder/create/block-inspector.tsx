"use client";

import {
  type Block,
  type BlockRegistry,
  type BlockStyle,
  type Device,
  type DimValue,
  getBlockStyle,
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
import { DeviceSelect, LocaleSelect, UnitSelect } from "./inspector-controls";

type PanelTab = "content" | "style" | "advanced";

export type BlockInspectorProps = {
  block: Block;
  registry: BlockRegistry;
  locale: string;
  locales: LocaleDefinition[];
  device: Device;
  onDeviceChange: (device: Device) => void;
  onLocaleChange: (locale: string) => void;
  onBack: () => void;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void;
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
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-gray-600 uppercase hover:bg-gray-50"
      >
        {title}
        <span className="text-gray-300">{open ? "▾" : "▸"}</span>
      </button>
      {open ? <div className="space-y-4 px-3 pb-3">{children}</div> : null}
    </div>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] tracking-wide text-gray-400 uppercase">
    {children}
  </div>
);

const COLOR_SWATCHES = [
  "#000000",
  "#111827",
  "#374151",
  "#6b7280",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

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
        className="h-7 w-7 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
      />
      <input
        value={value ?? ""}
        placeholder="#000000"
        onChange={(e) => onChange(e.target.value)}
        className="h-7 flex-1 rounded border border-gray-200 px-2 font-mono text-[11px] outline-none focus:border-gray-400"
      />
      {value ? (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          onClick={() => onChange("")}
          className="text-[10px] text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      ) : null}
    </div>
    <div className="flex flex-wrap gap-1">
      {COLOR_SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          aria-label={c}
          onClick={() => onChange(c)}
          className="h-4 w-4 rounded-sm border border-black/10"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  </div>
);

const DimField = ({
  label,
  value,
  onChange,
  units = ["px", "%", "rem", "vw", "auto"],
}: {
  label: string;
  value?: DimValue;
  onChange: (v: DimValue) => void;
  units?: DimValue["unit"][];
}) => {
  const dim = value ?? { value: "", unit: "px" };
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex gap-1">
        <input
          value={dim.unit === "auto" ? "" : (dim.value ?? "")}
          disabled={dim.unit === "auto"}
          placeholder={dim.unit === "auto" ? "auto" : "—"}
          aria-label={label}
          onChange={(e) => onChange({ ...dim, value: e.target.value })}
          className="h-7 flex-1 rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400 disabled:bg-gray-50"
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
          className="h-7 rounded border border-gray-200 px-1 text-[10px]"
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
      active
        ? "border-blue-300 bg-blue-50 text-blue-600"
        : "border-gray-200 text-gray-400 hover:bg-gray-50",
    )}
  >
    {children}
  </button>
);

const DeviceToggles = ({
  device,
  onChange,
}: {
  device: Device;
  onChange: (d: Device) => void;
}) => <DeviceSelect value={device} onChange={onChange} />;

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
  onDeviceChange: (d: Device) => void;
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

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex items-center gap-1">
          <DeviceToggles device={device} onChange={onDeviceChange} />
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
            className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50"
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
              value={box[side] ?? ""}
              placeholder="—"
              aria-label={`${label} ${side}`}
              onChange={(e) => setSide(side, e.target.value)}
              className="h-7 w-full rounded border border-gray-200 px-1 text-center text-[11px] outline-none focus:border-gray-400"
            />
            <div className="text-center text-[9px] text-gray-400 uppercase">
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
  device,
  onDeviceChange,
  onLocaleChange,
  onBack,
  onChange,
  onRemove,
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
  const toggleVisibility = (d: Device) => {
    const next = hiddenDevices.includes(d)
      ? hiddenDevices.filter((x) => x !== d)
      : [...hiddenDevices, d];
    onChange({
      visibility: { ...(block.visibility ?? {}), hiddenDevices: next },
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
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
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
            {ContentFields ? (
              <div className="space-y-3 text-[12px] [&_input]:h-8 [&_input]:w-full [&_input]:rounded [&_input]:border [&_input]:border-gray-200 [&_input]:px-2 [&_label]:mb-1 [&_label]:block [&_select]:h-8 [&_select]:w-full [&_select]:rounded [&_select]:border [&_select]:border-gray-200 [&_textarea]:w-full [&_textarea]:rounded [&_textarea]:border [&_textarea]:border-gray-200 [&_textarea]:px-2 [&_textarea]:py-1 [&_.pb-field-label]:mb-1 [&_.pb-field-label]:block [&_.pb-field-label]:text-[11px] [&_.pb-field-label]:tracking-wide [&_.pb-field-label]:text-gray-400 [&_.pb-field-label]:uppercase [&_.pb-field]:mb-3">
                <ContentFields
                  block={block}
                  locale={locale}
                  onChange={onChange}
                />
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">
                No content fields for this block type.
              </p>
            )}
          </div>
        ) : null}

        {tab === "style" ? (
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
              <span className="text-[11px] tracking-wide text-gray-400 uppercase">
                Screen
              </span>
              <DeviceSelect value={device} onChange={onDeviceChange} />
            </div>
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
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50",
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
                              ? "border-blue-300 bg-blue-50 text-blue-600"
                              : "border-gray-200 text-gray-400 hover:bg-gray-50",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    {activeStyle.widthMode === "boxed" ? (
                      <input
                        value={activeStyle.boxedMaxWidth ?? ""}
                        placeholder="1140px"
                        aria-label="Boxed max width"
                        onChange={(e) =>
                          patchStyle({ boxedMaxWidth: e.target.value })
                        }
                        className="mt-1 h-7 w-full rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
                      />
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
                    <div className="flex items-center justify-between">
                      <FieldLabel>Gap</FieldLabel>
                      <DeviceToggles
                        device={styleDevice}
                        onChange={onDeviceChange}
                      />
                    </div>
                    <input
                      value={activeStyle.gap ?? ""}
                      placeholder="e.g. 16px"
                      aria-label="Gap"
                      onChange={(e) => patchStyle({ gap: e.target.value })}
                      className="h-7 w-full rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 border-t border-gray-100 pt-3">
                <DimField
                  label="Width"
                  value={activeStyle.width}
                  onChange={(width) => patchStyle({ width })}
                  units={["px", "%", "vw", "auto"]}
                />
                <DimField
                  label="Height"
                  value={activeStyle.height}
                  onChange={(height) => patchStyle({ height })}
                  units={["px", "%", "vh", "auto"]}
                />
                <DimField
                  label="Min height"
                  value={activeStyle.minHeight}
                  onChange={(minHeight) => patchStyle({ minHeight })}
                  units={["px", "%", "vh", "auto"]}
                />
              </div>
            </Section>

            <Section title="Typography">
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
                <div className="flex items-center justify-between">
                  <FieldLabel>Font size</FieldLabel>
                  <DeviceToggles
                    device={styleDevice}
                    onChange={onDeviceChange}
                  />
                </div>
                <div className="flex gap-1">
                  <input
                    value={activeStyle.fontSize ?? ""}
                    placeholder="inherit"
                    aria-label="Font size"
                    onChange={(e) => patchStyle({ fontSize: e.target.value })}
                    className="h-7 flex-1 rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
                  />
                  <select
                    value={activeStyle.fontSizeUnit ?? "px"}
                    aria-label="Font size unit"
                    onChange={(e) =>
                      patchStyle({ fontSizeUnit: e.target.value })
                    }
                    className="h-7 rounded border border-gray-200 px-1 text-[10px]"
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
                <div className="grid grid-cols-4 gap-1">
                  {(
                    [
                      ["thin", "Thin"],
                      ["reg", "Reg"],
                      ["semi", "Semi"],
                      ["bold", "Bold"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => patchStyle({ fontWeight: id })}
                      className={cn(
                        "rounded border py-1 text-[11px] transition-colors",
                        activeStyle.fontWeight === id
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50",
                      )}
                    >
                      {label}
                    </button>
                  ))}
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
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50",
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
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50",
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

            <Section title="Border">
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
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50",
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
                      className="h-7 w-full rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
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
                  className="h-7 w-full rounded border border-gray-200 px-2 text-[11px] outline-none focus:border-gray-400"
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
                  className="w-full accent-blue-600"
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
                          ? "border-blue-300 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50",
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
            <Section title="Visibility">
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
                          ? "border-blue-200 bg-white text-gray-600"
                          : "border-dashed border-gray-200 bg-gray-50 text-gray-300 line-through",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="capitalize">{d}</span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Custom CSS">
              <div className="overflow-hidden rounded border border-gray-800 bg-gray-900">
                <div className="px-2.5 py-1 font-mono text-[10px] text-gray-400">
                  <span className="text-blue-300">.b-{block.id}</span>
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
              <p className="text-[10px] text-gray-500">
                Enter CSS declarations only, or a full rule using{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5">
                  .element
                </code>{" "}
                as a shortcut for{" "}
                <code className="rounded bg-gray-100 px-1 py-0.5">
                  .b-{block.id}
                </code>
                .
              </p>
            </Section>

            <Section title="Code" defaultOpen={false}>
              <BlockCodePanel block={block} />
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
