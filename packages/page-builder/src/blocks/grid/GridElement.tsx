import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { containerBackgroundStyle } from "../shared";

export const GridElement = ({ block, props, children }: BlockRenderProps) => {
  const bg = containerBackgroundStyle(props);
  const style = {
    display: "grid" as const,
    ...bg,
  };
  return (
    <div {...blockRootAttrs(block)} style={style}>
      {children}
    </div>
  );
};
