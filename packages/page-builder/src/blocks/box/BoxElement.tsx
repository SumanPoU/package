import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { containerBackgroundStyle } from "../shared";

export const BoxElement = ({ block, props, children }: BlockRenderProps) => {
  const style = containerBackgroundStyle(props);
  const tag = props.as === "section" ? "section" : "div";
  const Tag = tag as "div" | "section";
  return (
    <Tag {...blockRootAttrs(block)} style={style}>
      {children}
    </Tag>
  );
};
