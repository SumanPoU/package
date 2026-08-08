import { LOCALES, SUPPORTED_LANGUAGES } from '@/config/languages';

export const LANG_FIELD_MAP: Array<{ code: string; titleField: 'title' | 'title_np' }> = [
  { code: SUPPORTED_LANGUAGES[0]?.code ?? LOCALES.EN, titleField: 'title' },
  { code: SUPPORTED_LANGUAGES[1]?.code ?? LOCALES.NP, titleField: 'title_np' },
];

export function getLangCodeForField(field: 'title' | 'title_np'): string {
  return LANG_FIELD_MAP.find((l) => l.titleField === field)?.code ?? field;
}

export function getFieldForLangCode(code: string): 'title' | 'title_np' | null {
  return LANG_FIELD_MAP.find((l) => l.code === code)?.titleField ?? null;
}
