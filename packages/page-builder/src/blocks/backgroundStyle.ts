import type { CSSProperties } from "react";

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export type ContainerBackgroundProps = {
  backgroundType?: "color" | "image";
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  /** 0–100 dark overlay strength. */
  backgroundOverlay?: string | number;
  /** 0–100 background layer opacity (color alpha / image fade). */
  backgroundOpacity?: string | number;
};

const clampPct = (raw: unknown, fallback = 100): number => {
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
};

const escapeUrl = (url: string): string =>
  JSON.stringify(url).slice(1, -1);

/**
 * Author-owned background for containers / style CSS.
 * Dark overlay + optional fade via layered background-image (no ::before).
 */
export const resolveBackgroundStyle = (
  props: Record<string, unknown> | ContainerBackgroundProps,
): CSSProperties | undefined => {
  const type =
    props.backgroundType === "image" || props.backgroundType === "color"
      ? props.backgroundType
      : typeof props.backgroundImage === "string" &&
          String(props.backgroundImage).trim()
        ? "image"
        : typeof props.backgroundColor === "string" &&
            String(props.backgroundColor).trim()
          ? "color"
          : undefined;

  if (!type) {
    // Legacy: image URL only
    const bg = asString(props.backgroundImage).trim();
    if (!bg) return undefined;
    return legacyImageStyle(props, bg);
  }

  const overlay = clampPct(props.backgroundOverlay, 0) / 100;
  const opacity = clampPct(props.backgroundOpacity, 100) / 100;
  const style: CSSProperties = {};

  if (type === "color") {
    const color = asString(props.backgroundColor).trim();
    if (!color) return undefined;
    if (opacity < 1 && color.startsWith("#") && (color.length === 7 || color.length === 4)) {
      style.backgroundColor = hexToRgba(color, opacity);
    } else if (opacity < 1) {
      style.backgroundColor = color;
      style.opacity = undefined; // don't fade children — use overlay fade
      if (overlay <= 0) {
        style.backgroundImage = `linear-gradient(rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity}))`;
      }
    } else {
      style.backgroundColor = color;
    }
    if (overlay > 0) {
      const layers = [
        `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay}))`,
      ];
      if (opacity < 1 && !color.startsWith("#")) {
        layers.push(
          `linear-gradient(rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity}))`,
        );
      }
      style.backgroundImage = layers.join(", ");
    }
    return style;
  }

  const url = asString(props.backgroundImage).trim();
  if (!url) return undefined;
  return legacyImageStyle(props, url, overlay, opacity);
};

const legacyImageStyle = (
  props: Record<string, unknown> | ContainerBackgroundProps,
  url: string,
  overlay = clampPct(
    (props as ContainerBackgroundProps).backgroundOverlay,
    0,
  ) / 100,
  opacity = clampPct(
    (props as ContainerBackgroundProps).backgroundOpacity,
    100,
  ) / 100,
): CSSProperties => {
  const layers: string[] = [];
  if (overlay > 0) {
    layers.push(
      `linear-gradient(rgba(0,0,0,${overlay}), rgba(0,0,0,${overlay}))`,
    );
  }
  if (opacity < 1) {
    layers.push(
      `linear-gradient(rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity}))`,
    );
  }
  layers.push(`url(${escapeUrl(url)})`);

  const style: CSSProperties = {
    backgroundImage: layers.join(", "),
  };
  if (typeof props.backgroundSize === "string" && props.backgroundSize) {
    style.backgroundSize = props.backgroundSize;
  } else {
    style.backgroundSize = "cover";
  }
  if (typeof props.backgroundPosition === "string" && props.backgroundPosition) {
    style.backgroundPosition = props.backgroundPosition;
  } else {
    style.backgroundPosition = "center";
  }
  if (typeof props.backgroundRepeat === "string" && props.backgroundRepeat) {
    style.backgroundRepeat = props.backgroundRepeat;
  } else {
    style.backgroundRepeat = "no-repeat";
  }
  return style;
};

const hexToRgba = (hex: string, alpha: number): string => {
  let h = hex.slice(1);
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = Number.parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

/** CSS declarations string for blockStyleCss (same rules as resolveBackgroundStyle). */
export const backgroundStyleDeclarations = (
  style: ContainerBackgroundProps & {
    backgroundColor?: string;
    bg?: string;
  },
): string => {
  const resolved = resolveBackgroundStyle({
    backgroundType: style.backgroundType,
    backgroundColor: style.backgroundColor,
    backgroundImage: style.backgroundImage,
    backgroundSize: style.backgroundSize,
    backgroundPosition: style.backgroundPosition,
    backgroundRepeat: style.backgroundRepeat,
    backgroundOverlay: style.backgroundOverlay,
    backgroundOpacity: style.backgroundOpacity,
  });
  if (!resolved) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(resolved)) {
    if (v === undefined || v === "") continue;
    const cssKey = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    parts.push(`${cssKey}:${v}`);
  }
  return parts.join(";");
};
