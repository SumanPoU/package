import type { CSSProperties } from "react";

import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString } from "../shared";

const sizeStyle = (props: Record<string, unknown>): CSSProperties | undefined => {
  const width = asString(props.width).trim();
  const height = asString(props.height).trim();
  if (!width && !height) return undefined;
  return {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    maxWidth: "100%",
  };
};

export const ImageElement = ({ block, props }: BlockRenderProps) => {
  const src = asString(props.src);
  const alt = asString(props.alt);
  const style = sizeStyle(props);

  if (!src) {
    return (
      <span
        {...blockRootAttrs(block)}
        role="img"
        aria-label={alt || "Empty image"}
        style={style}
      />
    );
  }

  return (
    <img {...blockRootAttrs(block)} src={src} alt={alt} style={style} />
  );
};
