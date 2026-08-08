import type { Metadata } from '@/validations/common';
import { LOCALES } from '@/config/languages';
import { escapeHtml } from './escapeHtml';

export function buildMetaTags(args: {
  seoTitle: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
}) {
  const { seoTitle, description, keywords, canonicalUrl, ogImage } = args;
  const desc = description?.trim() ?? '';
  const keys = keywords?.trim() ?? '';
  const canonical = canonicalUrl?.trim() ?? '';
  const image = ogImage?.trim() ?? '';

  return `
  <title>${escapeHtml(seoTitle)}</title>${desc ? `\n  <meta name="description" content="${escapeHtml(desc)}" />` : ''}${
    keys ? `\n  <meta name="keywords" content="${escapeHtml(keys)}" />` : ''
  }${canonical ? `\n  <link rel="canonical" href="${escapeHtml(canonical)}" />` : ''}
  <meta property="og:title" content="${escapeHtml(seoTitle)}" />${
    desc ? `\n  <meta property="og:description" content="${escapeHtml(desc)}" />` : ''
  }
  <meta property="og:type" content="website" />${
    canonical ? `\n  <meta property="og:url" content="${escapeHtml(canonical)}" />` : ''
  }${image ? `\n  <meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${escapeHtml(seoTitle)}" />${
    desc ? `\n  <meta name="twitter:description" content="${escapeHtml(desc)}" />` : ''
  }${image ? `\n  <meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}`.trim();
}

export function getSeoValues(params: {
  lang: string;
  pageName: string;
  pageDescription: string;
  metadata?: Metadata;
}) {
  const { lang, pageName, pageDescription, metadata } = params;
  const isNepali = lang === LOCALES.NP;
  const seoTitle = (isNepali ? metadata?.seo_title_np : metadata?.seo_title)?.trim() || pageName;
  const description =
    (isNepali ? metadata?.seo_description_np : metadata?.seo_description)?.trim() ||
    pageDescription;
  const keywords = (isNepali ? metadata?.keywords_np : metadata?.keywords)?.trim() || '';
  const canonicalUrl = metadata?.url?.trim() || '';
  const ogImage = metadata?.image?.trim() || '';
  return { seoTitle, description, keywords, canonicalUrl, ogImage, isNepali };
}
