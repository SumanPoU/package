import type { Block } from '../../types';
import { collectAllBlockCssRules } from '../blockCss';

export function collectCss(blocks: Block[]) {
  return collectAllBlockCssRules(blocks, { mode: 'export' });
}
