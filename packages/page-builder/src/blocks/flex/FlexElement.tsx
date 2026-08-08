import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { containerBackgroundStyle } from "../shared";

export const FlexElement = ({ block, props, children }: BlockRenderProps) => {
  const bg = containerBackgroundStyle(props);
  const style = {
    display: "flex" as const,
    ...bg,
  };
  return (
    <div {...blockRootAttrs(block)} style={style}>
      {children}
    </div>
  );
};
