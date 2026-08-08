import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString } from "../shared";

export const ImageElement = ({ block, props }: BlockRenderProps) => {
  const src = asString(props.src);
  const alt = asString(props.alt);

  if (!src) {
    return (
      <span
        {...blockRootAttrs(block)}
        role="img"
        aria-label={alt || "Empty image"}
      />
    );
  }

  return <img {...blockRootAttrs(block)} src={src} alt={alt} />;
};
