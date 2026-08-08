export type NavLink = {
  label?: string;
  url?: string;
};

/**
 * Parses newline-delimited `Label,URL` lines into `{ label, url }`.
 *
 * Note: This intentionally preserves the legacy behavior used by `NavElement.tsx`
 * and `renderBlock.ts` (including the `filter(Boolean)` behavior).
 */
export function parseNavLinks(raw: string): NavLink[] {
  return (raw || '')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const [label, url] = l.split(',');
      return { label: label?.trim(), url: url?.trim() };
    });
}
