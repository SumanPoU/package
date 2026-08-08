import { cloneBlock } from "./blockTree";
import type { Block } from "./types";

export type ClipboardPayload = {
  block: Block;
  cut: boolean;
};

/** In-memory clipboard — not persisted across reloads unless host asks. */
let memory: ClipboardPayload | null = null;

export const setClipboard = (payload: ClipboardPayload | null): void => {
  memory = payload;
};

export const getClipboard = (): ClipboardPayload | null => memory;

export const clearClipboard = (): void => {
  memory = null;
};

/** Copy a block subtree into the clipboard (deep clone snapshot). */
export const copyBlockToClipboard = (block: Block): ClipboardPayload => {
  const payload: ClipboardPayload = {
    block: structuredCloneSafe(block),
    cut: false,
  };
  setClipboard(payload);
  return payload;
};

export const cutBlockToClipboard = (block: Block): ClipboardPayload => {
  const payload: ClipboardPayload = {
    block: structuredCloneSafe(block),
    cut: true,
  };
  setClipboard(payload);
  return payload;
};

/**
 * Produce a paste-ready clone with fresh ids for every node.
 * Clears `cut` flag after read so subsequent pastes are copies.
 */
export const takePasteClone = (): Block | null => {
  if (!memory) return null;
  const clone = cloneBlock(memory.block);
  if (memory.cut) {
    memory = { ...memory, cut: false };
  }
  return clone;
};

const structuredCloneSafe = (block: Block): Block => {
  if (typeof structuredClone === "function") {
    return structuredClone(block);
  }
  return JSON.parse(JSON.stringify(block)) as Block;
};
