import { blockRootAttrs } from "./blockClassName";
import type { BlockRenderProps } from "./types";

/**
 * Unknown / unregistered block type — tree-preserving placeholder.
 * Same component for canvas, preview, and Open Page (parity).
 */
export const FallbackBlock = ({ block, children }: BlockRenderProps) => (
  <div
    {...blockRootAttrs(block)}
    data-pb-fallback=""
    role="note"
    aria-label={`Unavailable block: ${block.type}`}
  >
    <span>Unavailable block: {block.type}</span>
    {children}
  </div>
);
