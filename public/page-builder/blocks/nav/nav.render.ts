import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

import { parseNavLinks } from './parseNavLinks';

export function renderNavToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const links = parseNavLinks(resolved.links || '');

  const linksHtml = links
    .map(
      (l) =>
        `<a href="${l.url || '#'}" style="font-size:0.875rem;font-weight:500;color:#4b5563;text-decoration:none">${l.label || 'Link'}</a>`,
    )
    .join('');

  return `<nav class="b-${block.id}" style="display:flex;gap:24px;padding:16px 0;width:100%">${linksHtml}</nav>`;
}
