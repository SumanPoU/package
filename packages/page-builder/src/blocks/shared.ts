import type { CSSProperties } from "react";

import { resolveBackgroundStyle } from "./backgroundStyle";

/** Apply author-owned background only when set — never a decorative default. */
export const containerBackgroundStyle = (
  props: Record<string, unknown>,
): CSSProperties | undefined => resolveBackgroundStyle(props);

export const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

/** Map author link flags → anchor target/rel (noopener when new window). */
export const linkTargetRel = (
  props: Record<string, unknown>,
): { target?: "_blank"; rel?: string } => {
  const openNew = Boolean(props.openInNewWindow);
  const nofollow = Boolean(props.nofollow);
  const relParts: string[] = [];
  if (openNew) {
    relParts.push("noopener", "noreferrer");
  }
  if (nofollow) {
    relParts.push("nofollow");
  }
  const rel = relParts.length ? [...new Set(relParts)].join(" ") : undefined;
  return {
    ...(openNew ? { target: "_blank" as const } : {}),
    ...(rel ? { rel } : {}),
  };
};
