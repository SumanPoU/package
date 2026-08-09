import type { CSSProperties } from "react";

import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString, linkTargetRel } from "../shared";

const CONTENT_WIDTH_MAP: Record<string, string> = {
  full: "100%",
  large: "1024px",
  medium: "768px",
  small: "480px",
};

const sizeStyle = (props: Record<string, unknown>): CSSProperties => {
  const contentWidth = asString(props.contentWidth, "large");
  const customW = asString(props.width).trim();
  const customH = asString(props.height).trim();
  const maxWidth =
    contentWidth === "custom"
      ? customW || "100%"
      : (CONTENT_WIDTH_MAP[contentWidth] ?? "1024px");

  return {
    width: contentWidth === "custom" && customW ? customW : "100%",
    maxWidth,
    height: customH || "auto",
    display: "block",
  };
};

export const ImageElement = ({ block, props }: BlockRenderProps) => {
  const src = asString(props.src);
  const alt = asString(props.alt);
  const href = asString(props.href).trim();
  const style = sizeStyle(props);
  const linkAttrs = linkTargetRel(props);
  const root = blockRootAttrs(block);

  if (!src) {
    return (
      <span
        {...root}
        role="img"
        aria-label={alt || "Empty image"}
        style={style}
      />
    );
  }

  const img = <img src={src} alt={alt} style={style} />;

  if (href) {
    return (
      <a
        {...root}
        href={href}
        {...linkAttrs}
        style={{ display: "inline-block", maxWidth: "100%" }}
      >
        {img}
      </a>
    );
  }

  return (
    <span {...root} style={{ display: "inline-block", maxWidth: "100%" }}>
      {img}
    </span>
  );
};
