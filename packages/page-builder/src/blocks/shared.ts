import type { CSSProperties } from "react";

/** Apply author-owned backgroundImage only when set — never a decorative default. */
export const containerBackgroundStyle = (
  props: Record<string, unknown>,
): CSSProperties | undefined => {
  const bg = props.backgroundImage;
  if (typeof bg !== "string" || !bg.trim()) return undefined;
  const style: CSSProperties = {
    backgroundImage: `url(${JSON.stringify(bg).slice(1, -1)})`,
  };
  if (typeof props.backgroundSize === "string" && props.backgroundSize) {
    style.backgroundSize = props.backgroundSize;
  }
  if (
    typeof props.backgroundPosition === "string" &&
    props.backgroundPosition
  ) {
    style.backgroundPosition = props.backgroundPosition;
  }
  if (typeof props.backgroundRepeat === "string" && props.backgroundRepeat) {
    style.backgroundRepeat = props.backgroundRepeat;
  }
  return style;
};

export const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;
