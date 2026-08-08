import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString } from "../shared";

export const ButtonElement = ({ block, props }: BlockRenderProps) => {
  const label = asString(props.label, "Button");
  const href = asString(props.href);

  if (href) {
    return (
      <a {...blockRootAttrs(block)} href={href} role="button">
        {label}
      </a>
    );
  }

  return (
    <button {...blockRootAttrs(block)} type="button">
      {label}
    </button>
  );
};
