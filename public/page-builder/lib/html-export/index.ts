import type { Block } from '../../types';
import type { Metadata } from '@/validations/common';
import { SUPPORTED_LANGUAGES } from '@/config/languages';

import { collectFonts } from './collectFonts';
import { collectCss } from './collectCss';
import { renderBlockToHtml } from './renderBlock';
import { buildMetaTags, getSeoValues } from './metaTags';

export function generatePreviewHTML(
  blocks: Block[],
  pageName: string,
  pageDescription: string,
  lang: string,
  metadata?: Metadata,
): string {
  const { seoTitle, description, keywords, canonicalUrl, ogImage, isNepali } = getSeoValues({
    lang,
    pageName,
    pageDescription,
    metadata,
  });

  const fontFamily = isNepali ? "'Mukta', sans-serif" : "'Outfit', sans-serif";
  const baseFontLink = isNepali
    ? '<link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />'
    : '<link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />';

  const usedFonts = collectFonts(blocks);
  let dynamicFontLink = '';
  if (usedFonts.size > 0) {
    const families = Array.from(usedFonts)
      .map((f) => `${f.replace(/ /g, '+')}:wght@300;400;500;600;700`)
      .join('&family=');
    dynamicFontLink = `\n  <link href="https://fonts.googleapis.com/css2?family=${families}&display=swap" rel="stylesheet" />`;
  }

  const fontLink = baseFontLink + dynamicFontLink;

  const globalCss = `  *,*::before,*::after{box-sizing:border-box}\n  body{margin:0;background:#fff;color:#111;font-family:${fontFamily}}\n  img{max-width:100%;height:auto}`;
  const cssRules = collectCss(blocks);
  const responsiveCss = cssRules.length
    ? '\n\n  /* Responsive & custom */\n  ' + cssRules.join('\n  ')
    : '';

  const metaTags = buildMetaTags({
    seoTitle,
    description,
    keywords,
    canonicalUrl,
    ogImage,
  });

  const body = blocks.map((b) => renderBlockToHtml({ block: b, lang })).join('\n');

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  const dir = langConfig?.dir ?? 'ltr';

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />${metaTags ? `\n  ${metaTags}` : ''}
  ${fontLink}
  <style>
${globalCss}${responsiveCss}
  </style>
</head>
<body>
${body || `  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;color:#9ca3af;font-size:16px">This page has no content yet.</div>`}
</body>
</html>`;
}
