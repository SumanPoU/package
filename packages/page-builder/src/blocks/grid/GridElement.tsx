import type { CSSProperties } from "react";

import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString, containerBackgroundStyle } from "../shared";

export const GridElement = ({ block, props, children }: BlockRenderProps) => {
  const bg = containerBackgroundStyle(props);
  const cols = asString(props.columns, "2").trim() || "2";
  const gap = asString(props.gap).trim();
  const rowGap = asString(props.rowGap).trim();
  const style: CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    ...(gap ? { columnGap: gap, gap: rowGap ? undefined : gap } : {}),
    ...(rowGap ? { rowGap } : {}),
    alignItems: asString(props.alignItems) || undefined,
    justifyItems: asString(props.justifyItems) || undefined,
    ...bg,
  };
  return (
    <div {...blockRootAttrs(block)} style={style}>
      {children}
    </div>
  );
};
