import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

/**
 * Export for container/flex/grid is intentionally handled by the
 * `isContainerType()` early branch in `lib/html-export/renderBlock.ts`
 * (avoids circular import until ExportContext/renderChild exists).
 * This stub satisfies BlockDefinition; it is not the live export path.
 */
export function renderContainerToHtml(_block: Block, _ctx: ExportContext): string {
  return '';
}
