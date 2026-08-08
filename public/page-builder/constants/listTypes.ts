export type ListType =
  | 'unordered'
  | 'ordered'
  | 'lower-alpha'
  | 'upper-alpha'
  | 'lower-roman'
  | 'upper-roman';

export const LIST_TYPE_OPTIONS: { value: ListType; label: string }[] = [
  { value: 'unordered', label: 'Bullet (unordered)' },
  { value: 'ordered', label: 'Numbered (1, 2, 3…)' },
  { value: 'lower-alpha', label: 'Lowercase letters (a, b, c…)' },
  { value: 'upper-alpha', label: 'Uppercase letters (A, B, C…)' },
  { value: 'lower-roman', label: 'Lowercase roman (i, ii, iii…)' },
  { value: 'upper-roman', label: 'Uppercase roman (I, II, III…)' },
];

export function normalizeListType(value?: string): ListType {
  if (LIST_TYPE_OPTIONS.some((opt) => opt.value === value)) {
    return value as ListType;
  }
  return 'unordered';
}

export function getListRenderConfig(listType?: string) {
  const type = normalizeListType(listType);

  switch (type) {
    case 'ordered':
      return { tag: 'ol' as const, listStyleType: 'decimal', className: 'list-decimal' };
    case 'lower-alpha':
      return { tag: 'ol' as const, listStyleType: 'lower-alpha', className: 'list-[lower-alpha]' };
    case 'upper-alpha':
      return { tag: 'ol' as const, listStyleType: 'upper-alpha', className: 'list-[upper-alpha]' };
    case 'lower-roman':
      return { tag: 'ol' as const, listStyleType: 'lower-roman', className: 'list-[lower-roman]' };
    case 'upper-roman':
      return { tag: 'ol' as const, listStyleType: 'upper-roman', className: 'list-[upper-roman]' };
    default:
      return { tag: 'ul' as const, listStyleType: 'disc', className: 'list-disc' };
  }
}

/** Parse newline-delimited list items from stored i18n value. */
export function parseListItems(raw: string): string[] {
  if (!raw) return [];
  if (raw === ' ') return [''];
  return raw.split('\n');
}

/** Serialize list items for storage. */
export function serializeListItems(items: string[]): string {
  if (items.length === 0) return '';
  return items.join('\n');
}

/** Append a new empty list row; handles the empty-string edge case for new locales. */
export function appendListItem(raw: string): string {
  if (!raw) return ' ';
  return `${raw}\n`;
}
