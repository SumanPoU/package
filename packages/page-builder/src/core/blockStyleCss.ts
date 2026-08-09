import { backgroundStyleDeclarations } from "../blocks/backgroundStyle";
import { blockSelector } from "./blockClassName";
import type { Block, Device } from "./types";

export type SpacingBox = {
  t?: string;
  r?: string;
  b?: string;
  l?: string;
  unit?: "px" | "rem" | "%" | "em";
  linked?: boolean;
};

export type DimValue = {
  value?: string;
  unit?: "px" | "%" | "rem" | "em" | "vw" | "vh" | "auto";
};

export type BlockStyle = {
  align?: "left" | "center" | "right";
  margin?: SpacingBox;
  padding?: SpacingBox;
  paddingY?: "none" | "sm" | "md" | "lg";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  /** Container width mode (Elementor-style). */
  widthMode?: "full" | "boxed";
  boxedMaxWidth?: string;
  width?: DimValue;
  height?: DimValue;
  minHeight?: DimValue;
  fontFamily?: string;
  fontSize?: string;
  fontSizeUnit?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  letterSpacingUnit?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textColor?: string;
  backgroundColor?: string;
  /** Style-tab background type (color | image). */
  backgroundType?: "color" | "image";
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundOverlay?: string;
  backgroundOpacity?: string;
  /** Preset bg when no custom color. */
  bg?: "none" | "gray" | "dark";
  borderStyle?: "none" | "solid" | "dashed" | "dotted" | "double";
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  opacity?: string;
  /** Author CSS id on the block root (Advanced). */
  cssId?: string;
  /** Extra author classes on the block root (Advanced). */
  cssClasses?: string;
};

const PADDING_PRESET: Record<string, string> = {
  none: "",
  sm: "padding-top:0.75rem;padding-bottom:0.75rem",
  md: "padding-top:2rem;padding-bottom:2rem",
  lg: "padding-top:4rem;padding-bottom:4rem",
};

const FONT_WEIGHT: Record<string, string> = {
  thin: "300",
  reg: "400",
  semi: "600",
  bold: "700",
  "100": "100",
  "200": "200",
  "300": "300",
  "400": "400",
  "500": "500",
  "600": "600",
  "700": "700",
  "800": "800",
  "900": "900",
};

const BG_PRESET: Record<string, string> = {
  none: "",
  gray: "background-color:#f3f4f6",
  dark: "background-color:#1f2937;color:#f3f4f6",
};

const backgroundStyleToDecls = (style: BlockStyle): string => {
  if (
    style.backgroundType === "image" ||
    style.backgroundType === "color" ||
    style.backgroundImage?.trim()
  ) {
    return backgroundStyleDeclarations({
      backgroundType: style.backgroundType,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      backgroundSize: style.backgroundSize,
      backgroundPosition: style.backgroundPosition,
      backgroundRepeat: style.backgroundRepeat,
      backgroundOverlay: style.backgroundOverlay,
      backgroundOpacity: style.backgroundOpacity,
    });
  }
  return "";
};

const deviceMediaQuery = (device: Device): string => {
  if (device === "desktop") return "@media(min-width:1024px)";
  if (device === "tablet")
    return "@media(min-width:640px) and (max-width:1023px)";
  return "@media(max-width:639px)";
};

export const getBlockStyle = (block: Block): BlockStyle =>
  (block.style as BlockStyle | undefined) ?? {};

export const resolveCustomCssText = (raw: string, blockId: string): string =>
  raw.trim().replace(/\.element\b/g, blockSelector(blockId));

/**
 * Declaration-only (`color: red;`) or full rules (`.element { … }`).
 * `.element` → `.b-{id}`.
 */
export const formatCustomCssRules = (
  raw: string,
  blockId: string,
): string[] => {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const resolved = resolveCustomCssText(trimmed, blockId);
  if (resolved.includes("{")) return [resolved];
  return [`${blockSelector(blockId)}{${resolved}}`];
};

const spacingCss = (prefix: "margin" | "padding", box?: SpacingBox): string => {
  if (!box) return "";
  const unit = box.unit ?? "px";
  const parts: string[] = [];
  const map = [
    ["t", "top"],
    ["r", "right"],
    ["b", "bottom"],
    ["l", "left"],
  ] as const;
  for (const [k, side] of map) {
    const v = box[k];
    if (v === undefined || v === "" || v === "—") continue;
    parts.push(`${prefix}-${side}:${v}${unit}`);
  }
  return parts.join(";");
};

const dimCss = (prop: string, dim?: DimValue): string => {
  if (!dim) return "";
  const unit = dim.unit ?? "px";
  if (unit === "auto") return `${prop}:auto`;
  if (dim.value === undefined || dim.value === "") return "";
  return `${prop}:${dim.value}${unit}`;
};

export const buildStyleDeclarations = (
  style: BlockStyle,
  blockType: string,
): string => {
  const parts: string[] = [];
  if (style.align) parts.push(`text-align:${style.align}`);
  const margin = spacingCss("margin", style.margin);
  if (margin) parts.push(margin);
  const padding = spacingCss("padding", style.padding);
  if (padding) parts.push(padding);
  else if (style.paddingY && PADDING_PRESET[style.paddingY]) {
    parts.push(PADDING_PRESET[style.paddingY]!);
  }

  if (style.widthMode === "boxed") {
    parts.push("width:100%");
    parts.push(`max-width:${style.boxedMaxWidth?.trim() || "1140px"}`);
    parts.push("margin-left:auto");
    parts.push("margin-right:auto");
  } else if (style.widthMode === "full") {
    parts.push("width:100%");
  }

  const w = dimCss("width", style.width);
  if (w && style.widthMode !== "full" && style.widthMode !== "boxed") {
    parts.push(w);
  }
  const h = dimCss("height", style.height);
  if (h) parts.push(h);
  const mh = dimCss("min-height", style.minHeight);
  if (mh) parts.push(mh);

  if (style.fontFamily?.trim()) {
    parts.push(`font-family:${style.fontFamily}`);
  }
  if (style.fontSize?.trim() && style.fontSize !== "inherit") {
    parts.push(`font-size:${style.fontSize}${style.fontSizeUnit ?? "px"}`);
  }
  if (style.fontWeight) {
    parts.push(
      `font-weight:${FONT_WEIGHT[style.fontWeight] ?? style.fontWeight}`,
    );
  }
  if (style.lineHeight?.trim()) parts.push(`line-height:${style.lineHeight}`);
  if (style.letterSpacing?.trim()) {
    const lsUnit = style.letterSpacingUnit ?? "px";
    const ls = style.letterSpacing.trim();
    const hasUnit = /[a-z%]+$/i.test(ls);
    parts.push(`letter-spacing:${hasUnit ? ls : `${ls}${lsUnit}`}`);
  }
  if (style.textTransform && style.textTransform !== "none") {
    parts.push(`text-transform:${style.textTransform}`);
  }
  if (style.textColor) parts.push(`color:${style.textColor}`);

  // Background: prefer explicit type/image/color fields (Style tab).
  const bgDecls = backgroundStyleToDecls(style);
  if (bgDecls) {
    parts.push(bgDecls);
  } else if (style.backgroundColor) {
    parts.push(`background-color:${style.backgroundColor}`);
  } else if (style.bg && BG_PRESET[style.bg]) {
    parts.push(BG_PRESET[style.bg]!);
  }

  if (style.borderStyle && style.borderStyle !== "none") {
    parts.push(`border-style:${style.borderStyle}`);
    parts.push(`border-width:${style.borderWidth?.trim() || "1px"}`);
    if (style.borderColor) parts.push(`border-color:${style.borderColor}`);
  }
  if (style.borderRadius?.trim()) {
    parts.push(`border-radius:${style.borderRadius}`);
  }
  if (style.boxShadow?.trim()) parts.push(`box-shadow:${style.boxShadow}`);

  if (style.opacity !== undefined && style.opacity !== "") {
    const n = Number(style.opacity);
    parts.push(
      `opacity:${Number.isFinite(n) && n > 1 ? n / 100 : style.opacity}`,
    );
  }

  const isFlex =
    blockType === "flex" || blockType === "container" || blockType === "box";
  if (isFlex) {
    if (
      style.flexDirection ||
      style.justifyContent ||
      style.alignItems ||
      style.gap
    ) {
      parts.push("display:flex");
    }
    if (style.flexDirection)
      parts.push(`flex-direction:${style.flexDirection}`);
    if (style.justifyContent)
      parts.push(`justify-content:${style.justifyContent}`);
    if (style.alignItems) parts.push(`align-items:${style.alignItems}`);
    if (style.gap) parts.push(`gap:${style.gap}`);
  }

  if (blockType === "grid") {
    if (style.gap) parts.push(`gap:${style.gap}`);
  }

  return parts.filter(Boolean).join(";");
};

export const buildBlockStyleRule = (
  block: Block,
  style: BlockStyle = getBlockStyle(block),
): string | null => {
  const decls = buildStyleDeclarations(style, block.type);
  if (!decls) return null;
  return `${blockSelector(block.id)}{${decls}}`;
};

const mergeStyle = (
  base: BlockStyle,
  override?: Record<string, unknown>,
): BlockStyle => (override ? ({ ...base, ...override } as BlockStyle) : base);

/** Structured style + customCss + device visibility → CSS rules. */
export const collectBlockStyleCssRules = (block: Block): string[] => {
  const rules: string[] = [];
  const base = getBlockStyle(block);
  const baseRule = buildBlockStyleRule(block, base);
  if (baseRule) rules.push(baseRule);

  const responsive = block.responsiveStyle ?? {};
  for (const device of ["tablet", "mobile"] as const) {
    const override = responsive[device] as Record<string, unknown> | undefined;
    if (!override || !Object.keys(override).length) continue;
    const merged = mergeStyle(base, override);
    const decls = buildStyleDeclarations(merged, block.type);
    if (!decls) continue;
    const sel = blockSelector(block.id);
    // Real breakpoints (Open Page / Preview in a real viewport).
    rules.push(`${deviceMediaQuery(device)}{${sel}{${decls}}}`);
    // Canvas device frame is CSS-width only — viewport media queries never
    // match. Attribute selectors apply when the editor sets data-pb-device.
    rules.push(`[data-pb-device="${device}"] ${sel}{${decls}}`);
  }

  if (block.customCss?.trim()) {
    rules.push(...formatCustomCssRules(block.customCss, block.id));
  }

  const hidden = block.visibility?.hiddenDevices ?? [];
  if (hidden.includes("desktop")) {
    rules.push(
      `@media(min-width:1024px){${blockSelector(block.id)}{display:none!important}}`,
    );
  }
  if (hidden.includes("tablet")) {
    rules.push(
      `@media(min-width:640px) and (max-width:1023px){${blockSelector(block.id)}{display:none!important}}`,
    );
  }
  if (hidden.includes("mobile")) {
    rules.push(
      `@media(max-width:639px){${blockSelector(block.id)}{display:none!important}}`,
    );
  }

  return rules;
};

export const collectAllBlockStyleCss = (blocks: Block[]): string[] => {
  const rules: string[] = [];
  const walk = (block: Block) => {
    rules.push(...collectBlockStyleCssRules(block));
    block.children?.forEach(walk);
  };
  blocks.forEach(walk);
  return rules;
};
