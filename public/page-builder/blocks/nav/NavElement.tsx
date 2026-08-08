import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

import { parseNavLinks } from './parseNavLinks';

export function NavElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const links = parseNavLinks(resolved.links || '');

  return (
    <nav style={st} className="flex gap-6 w-full py-4 border-b border-gray-100">
      {links.map((l, i) => (
        <a
          key={i}
          href={l.url || '#'}
          onClick={(e) => e.preventDefault()}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {l.label || 'Link'}
        </a>
      ))}
    </nav>
  );
}
