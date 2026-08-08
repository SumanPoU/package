import { useState } from 'react';
import { LOCALES, SUPPORTED_LANGUAGES } from '@/config/languages';
import type { Metadata } from '@/validations/common';
import { nanoid, toSlug } from '../utils';

export function usePageMeta(currentLang: string) {
  const [pageId, setPageId] = useState<string | number>(() => nanoid());
  const [pageNameI18n, setPageNameI18n] = useState<Record<string, string>>({
    [currentLang]: 'Untitled page',
  });
  const [pageDescI18n, setPageDescI18n] = useState<Record<string, string>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [status, setStatus] = useState<boolean>(true);
  const [metadata, setMetadata] = useState<Metadata>({
    seo_title: '',
    seo_title_np: '',
    seo_description: '',
    seo_description_np: '',
    keywords: '',
    keywords_np: '',
    url: '',
    image: '',
  });
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const primaryLangCode = SUPPORTED_LANGUAGES[0]?.code ?? LOCALES.EN;
  const secondaryLangCode = SUPPORTED_LANGUAGES[1]?.code ?? LOCALES.NP;

  const pageName =
    pageNameI18n[currentLang] ?? pageNameI18n[Object.keys(pageNameI18n)[0]] ?? 'Untitled page';
  const pageDescription = pageDescI18n[currentLang] ?? '';

  // Slug is always derived from English (primary) so switching to NP does not
  // collapse non-Latin titles into the `/page` fallback.
  const pageNameEn = pageNameI18n[primaryLangCode] ?? pageNameI18n[LOCALES.EN] ?? 'Untitled page';
  const pageSlug = toSlug(pageNameEn);

  const setPageName = (val: string) => setPageNameI18n((p) => ({ ...p, [currentLang]: val }));
  const setPageDescription = (val: string) =>
    setPageDescI18n((p) => ({ ...p, [currentLang]: val }));

  const updateMetadataField = (key: keyof Metadata, value: string) =>
    setMetadata((p) => ({ ...p, [key]: value }));

  return {
    pageId,
    setPageId,
    pageNameI18n,
    setPageNameI18n,
    pageName,
    pageNameEn,
    pageSlug,
    pageDescription,
    setPageName,
    setPageDescription,
    settingsOpen,
    setSettingsOpen,
    savedFlash,
    setSavedFlash,
    status,
    setStatus,
    metadata,
    setMetadata,
    updateMetadataField,
    codeOpen,
    setCodeOpen,
    codeCopied,
    setCodeCopied,
    primaryLangCode,
    secondaryLangCode,
  };
}
