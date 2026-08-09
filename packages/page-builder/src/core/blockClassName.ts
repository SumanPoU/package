import { getBlockMotion, hasActiveEntrance, hasActiveHover } from "./motion";
import type { Block } from "./types";

export const blockClassName = (blockId: string): string => `b-${blockId}`;

export const blockSelector = (blockId: string): string =>
  `.${blockClassName(blockId)}`;

type BlockRootAttrs = {
  "data-block-id": string;
  "data-block-type": string;
  className: string;
  id?: string;
  "data-pb-motion"?: string;
  "data-pb-motion-trigger"?: string;
  "data-pb-hover"?: string;
};

/** Root attrs for every block render — one path for canvas / preview / open. */
export const blockRootAttrs = (block: Block): BlockRootAttrs => {
  const style = (block.style ?? {}) as {
    cssId?: string;
    cssClasses?: string;
  };
  const extraClasses = style.cssClasses?.trim() ?? "";
  const cssId = style.cssId?.trim();
  const motion = getBlockMotion(block);

  return {
    "data-block-id": block.id,
    "data-block-type": block.type,
    className: [blockClassName(block.id), extraClasses]
      .filter(Boolean)
      .join(" "),
    ...(cssId ? { id: cssId } : {}),
    ...(hasActiveEntrance(motion)
      ? {
          "data-pb-motion": motion.entrance,
          "data-pb-motion-trigger": motion.trigger ?? "scroll",
        }
      : {}),
    ...(hasActiveHover(motion) ? { "data-pb-hover": motion.hover } : {}),
  };
};
