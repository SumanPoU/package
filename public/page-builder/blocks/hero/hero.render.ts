import { resolveProps } from '../../lib/i18nResolve';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

export function renderHeroToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const align = resolved.alignment || 'center';
  const textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const bgColor = resolved.backgroundColor || '#0f172a';
  const opacity = Math.min(1, Math.max(0, parseFloat(resolved.overlayOpacity || '0') || 0));
  const bgImage = resolved.backgroundImage
    ? `background-image:url('${resolved.backgroundImage}');background-size:cover;background-position:center;`
    : '';
  const target =
    resolved.ctaTarget === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
  const cta =
    resolved.ctaLabel && resolved.ctaUrl
      ? `<a href="${resolved.ctaUrl}"${target} style="display:inline-block;margin-top:24px;padding:12px 24px;border-radius:6px;background:#ffffff;color:#0f172a;text-decoration:none;font-weight:600;font-size:14px">${resolved.ctaLabel}</a>`
      : '';

  return `<section class="b-${block.id}" style="position:relative;width:100%;min-height:360px;display:flex;align-items:center;justify-content:${justify};padding:64px 24px;background-color:${bgColor};${bgImage}color:#ffffff;text-align:${textAlign}">
  <div style="position:absolute;inset:0;background:rgba(0,0,0,${opacity});pointer-events:none"></div>
  <div style="position:relative;z-index:1;max-width:720px;width:100%">
    <h1 style="margin:0 0 12px;font-size:2.5rem;font-weight:700;line-height:1.15">${resolved.heading}</h1>
    <p style="margin:0;font-size:1.125rem;line-height:1.6;opacity:0.9">${resolved.subheading}</p>
    ${cta}
  </div>
</section>`;
}
