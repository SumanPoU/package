import { blockRootAttrs } from "../../core/blockClassName";
import type { BlockRenderProps } from "../../core/types";
import { asString, linkTargetRel } from "../shared";

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export const HeadingElement = ({ block, props }: BlockRenderProps) => {
  const level = asString(props.level, "h2");
  const Tag = (HEADING_TAGS.has(level) ? level : "h2") as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  const title = asString(props.title);
  const href = asString(props.href);
  const linkAttrs = linkTargetRel(props);

  const content = href ? (
    <a href={href} {...linkAttrs}>
      {title}
    </a>
  ) : (
    title
  );

  return <Tag {...blockRootAttrs(block)}>{content}</Tag>;
};
