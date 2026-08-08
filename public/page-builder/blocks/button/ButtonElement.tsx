import { Button } from '@/components/ui/button';

import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function ButtonElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);

  if (block.style.backgroundColor) {
    st.backgroundColor = block.style.backgroundColor;
  }

  st.color = 'inherit';

  // Also apply padding and border radius to the button itself for better UI
  const p = block.style.padding;
  if (p.top || p.right || p.bottom || p.left) {
    st.padding = `${p.top || 0}${p.unit} ${p.right || 0}${p.unit} ${p.bottom || 0}${p.unit} ${p.left || 0}${p.unit}`;
  }

  const br = block.style.borderRadius;
  if (br.topLeft || br.topRight || br.bottomRight || br.bottomLeft) {
    st.borderRadius = `${br.topLeft || 0}${br.unit} ${br.topRight || 0}${br.unit} ${br.bottomRight || 0}${br.unit} ${br.bottomLeft || 0}${br.unit}`;
  }

  if (resolved.href) {
    return (
      <Button size="sm" style={st} asChild>
        <a
          href={resolved.href}
          target={resolved.target === '_blank' ? '_blank' : undefined}
          rel={resolved.target === '_blank' ? 'noopener noreferrer' : undefined}
        >
          {resolved.text}
        </a>
      </Button>
    );
  }

  return (
    <Button size="sm" style={st}>
      {resolved.text}
    </Button>
  );
}
