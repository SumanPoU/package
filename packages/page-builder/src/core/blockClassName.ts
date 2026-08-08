import type { Block } from "./types";

export const blockClassName = (blockId: string): string => `b-${blockId}`;

export const blockSelector = (blockId: string): string =>
  `.${blockClassName(blockId)}`;

type BlockRootAttrs = {
  "data-block-id": string;
  "data-block-type": string;
  className: string;
  id?: string;
};

/** Root attrs for every block render — one path for canvas / preview / open. */
export const blockRootAttrs = (block: Block): BlockRootAttrs => {
  const style = (block.style ?? {}) as {
    cssId?: string;
    cssClasses?: string;
  };
  const extraClasses = style.cssClasses?.trim() ?? "";
  const cssId = style.cssId?.trim();

  return {
    "data-block-id": block.id,
    "data-block-type": block.type,
    className: [blockClassName(block.id), extraClasses]
      .filter(Boolean)
      .join(" "),
    ...(cssId ? { id: cssId } : {}),
  };
};
