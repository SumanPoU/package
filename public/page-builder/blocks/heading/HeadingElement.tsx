import type React from 'react';

import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function HeadingElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);

  // Default to h2 if not specified, but respect level 1-6
  const level = resolved.level || '2';
  const Tag = `h${level}` as React.ElementType;

  // Determine appropriate Tailwind size classes based on level
  const sizeClass =
    {
      '1': 'text-4xl',
      '2': 'text-2xl',
      '3': 'text-xl',
      '4': 'text-lg',
      '5': 'text-base',
      '6': 'text-sm',
    }[level as string] || 'text-2xl';

  return (
    <Tag
      className={`${sizeClass} font-bold leading-tight text-inherit m-0`}
      style={{ ...st, color: 'inherit' }}
    >
      {resolved.text}
    </Tag>
  );
}
