import type { CSSProperties } from "react";

import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString, containerBackgroundStyle } from "../shared";

export const FlexElement = ({ block, props, children }: BlockRenderProps) => {
  const bg = containerBackgroundStyle(props);
  const style: CSSProperties = {
    display: "flex",
    flexDirection: (asString(props.direction, "row") ||
      "row") as CSSProperties["flexDirection"],
    justifyContent: asString(props.justifyContent) || undefined,
    alignItems: asString(props.alignItems) || undefined,
    gap: asString(props.gap) || undefined,
    flexWrap: (asString(props.flexWrap) ||
      undefined) as CSSProperties["flexWrap"],
    ...bg,
  };
  return (
    <div {...blockRootAttrs(block)} style={style}>
      {children}
    </div>
  );
};
