import type { Block } from "./types";

export const blockClassName = (blockId: string): string => `b-${blockId}`;

export const blockSelector = (blockId: string): string =>
  `.${blockClassName(blockId)}`;

/** Root attrs for every block render — one path for canvas / preview / open. */
export const blockRootAttrs = (
  block: Block,
): {
  "data-block-id": string;
  "data-block-type": string;
  className: string;
} => ({
  "data-block-id": block.id,
  "data-block-type": block.type,
  className: blockClassName(block.id),
});
