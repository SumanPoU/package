import type { Block } from '../types';
import { getBlockDefinition } from '../core/registry';

function warnUnknownBlockType(type: string): void {
  if (import.meta.env.DEV) {
    console.warn(`[page-builder] Skipping unregistered block type "${type}" on canvas.`);
  }
}

export function ElementRenderer({ block, lang }: { block: Block; lang: string }) {
  const def = getBlockDefinition(block.type);
  if (!def) {
    warnUnknownBlockType(block.type);
    return null;
  }

  const Canvas = def.CanvasComponent;
  return <Canvas block={block} lang={lang} />;
}
