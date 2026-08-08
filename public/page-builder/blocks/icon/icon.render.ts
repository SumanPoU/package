import React from 'react';
import { renderToString } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';

import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderIconToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const s = block.style;
  const isDark = s.bg === 'dark' && !s.backgroundColor;
  const color = s.textColor || (isDark ? '#f3f4f6' : '#111827');
  const Icon = (LucideIcons as any)[resolved.iconName || 'Smile'] || LucideIcons.Smile;
  const svgStr = renderToString(React.createElement(Icon, { size: 32, color }));
  return `<div class="b-${block.id}" style="display:inline-flex;align-items:center;justify-content:center">${svgStr}</div>`;
}
