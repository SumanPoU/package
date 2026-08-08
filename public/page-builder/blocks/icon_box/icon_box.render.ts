import React from 'react';
import { renderToString } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';

import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderIconBoxToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const s = block.style;
  const isDark = s.bg === 'dark' && !s.backgroundColor;
  const color = s.textColor || (isDark ? '#f3f4f6' : '#111827');
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const Icon = (LucideIcons as any)[resolved.iconName || 'Star'] || LucideIcons.Star;
  const svgStr = renderToString(React.createElement(Icon, { size: 40, color: '#3b82f6' }));
  return `<div class="b-${block.id}" style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:16px">
          <div style="margin-bottom:12px">${svgStr}</div>
          <h3 style="font-size:1.125rem;font-weight:600;margin:0 0 8px 0;color:${color}">${resolved.title}</h3>
          <p style="font-size:0.875rem;color:${muted};margin:0">${resolved.description}</p>
        </div>`;
}
