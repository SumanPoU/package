import type { Block, ComponentType, I18nProps } from '../types';
import { TRANSLATABLE_PROPS, SHARED_PROPS } from '../constants';

export function buildInitialI18nProps(
  type: ComponentType,
  defaultProps: Record<string, string>,
  defaultLang: string,
): I18nProps {
  const keys = TRANSLATABLE_PROPS[type] ?? [];
  const i18n: I18nProps = {};
  for (const k of keys) i18n[k] = { [defaultLang]: defaultProps[k] ?? '' };
  return i18n;
}

export function resolveProps(block: Block, lang: string): Record<string, string> {
  const translatableKeys = TRANSLATABLE_PROPS[block.type] ?? [];
  const sharedKeys = SHARED_PROPS[block.type] ?? [];
  const resolved: Record<string, string> = { ...block.props };
  for (const k of sharedKeys) resolved[k] = block.props[k] ?? '';
  for (const k of translatableKeys) {
    const langMap = block.i18nProps[k] ?? {};
    resolved[k] = langMap[lang] ?? Object.values(langMap)[0] ?? block.props[k] ?? '';
  }
  return resolved;
}
