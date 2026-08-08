import type { Block } from '../../types';
import { resolveProps } from '../../utils';

export function HeroElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const align = (resolved.alignment || 'center') as 'left' | 'center' | 'right';
  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  const opacity = Math.min(1, Math.max(0, parseFloat(resolved.overlayOpacity || '0') || 0));

  return (
    <section
      className="relative w-full min-h-[360px] flex items-center px-6 py-16 text-white"
      style={{
        justifyContent: justify,
        textAlign: align,
        backgroundColor: resolved.backgroundColor || '#0f172a',
        backgroundImage: resolved.backgroundImage
          ? `url('${resolved.backgroundImage}')`
          : undefined,
        backgroundSize: resolved.backgroundImage ? 'cover' : undefined,
        backgroundPosition: resolved.backgroundImage ? 'center' : undefined,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `rgba(0,0,0,${opacity})` }}
      />
      <div className="relative z-[1] w-full max-w-[720px]">
        <h1 className="m-0 mb-3 text-4xl font-bold leading-[1.15]">{resolved.heading}</h1>
        <p className="m-0 text-lg leading-relaxed opacity-90">{resolved.subheading}</p>
        {resolved.ctaLabel && resolved.ctaUrl ? (
          <a
            href={resolved.ctaUrl}
            target={resolved.ctaTarget === '_blank' ? '_blank' : undefined}
            rel={resolved.ctaTarget === '_blank' ? 'noopener noreferrer' : undefined}
            className="inline-block mt-6 px-6 py-3 rounded-md bg-white text-slate-900 no-underline font-semibold text-sm"
          >
            {resolved.ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
