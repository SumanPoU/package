import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString, linkTargetRel } from "../shared";

export const ButtonElement = ({ block, props }: BlockRenderProps) => {
  const label = asString(props.label, "Button");
  const href = asString(props.href);
  const linkAttrs = linkTargetRel(props);

  if (href) {
    return (
      <a {...blockRootAttrs(block)} href={href} role="button" {...linkAttrs}>
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
