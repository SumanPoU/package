import type { Block } from '../../types';
import { resolveProps, getInheritStyle } from '../../utils';
import { getListRenderConfig, parseListItems } from '../../constants/listTypes';

export function ListElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const { tag: Tag, className } = getListRenderConfig(resolved.listType);
  const items = parseListItems(resolved.items);

  return (
    <Tag
      className={`${className} pl-5 text-sm text-inherit space-y-1 text-left`}
      style={{ ...st, color: 'inherit' }}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}
