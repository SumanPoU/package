import { Square, Trash2, Copy, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import type { Block, Device } from '../types';
import { COMPONENT_LIBRARY, TRANSLATABLE_PROPS } from '../constants';
import { isRegisteredBlockType } from '../core/registry';

export type OutlineListProps = {
  blocks: Block[];
  depth: number;
  selectedId: string | null;
  device: Device;
  lang: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (block: Block) => void;
};

export function OutlineList({
  blocks,
  depth,
  selectedId,
  device,
  lang,
  onSelect,
  onRemove,
  onDuplicate,
}: OutlineListProps) {
  return (
    <ul className="space-y-1">
      {blocks
        .filter((block) => isRegisteredBlockType(block.type))
        .map((block, i) => {
          const def = COMPONENT_LIBRARY.find((c) => c.type === block.type);
          const Icon = def?.icon ?? Square;
          const hidden = !block.visibility[device];
          const hasMissing =
            SUPPORTED_LANGUAGES.length > 1 &&
            TRANSLATABLE_PROPS[block.type]?.some((k) => !block.i18nProps[k]?.[lang]?.trim());
          return (
            <li key={block.id}>
              <button
                onClick={() => onSelect(block.id)}
                style={{ paddingLeft: 8 + depth * 16 }}
                className={cn(
                  'group flex w-full items-center justify-between rounded-lg py-2 pr-2 text-left text-[12px] font-medium transition-all duration-200',
                  selectedId === block.id
                    ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900',
                  hidden && 'opacity-40 grayscale',
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px] w-4 text-right select-none">
                    {i + 1}.
                  </span>
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5',
                      selectedId === block.id ? 'text-primary' : 'text-gray-400',
                    )}
                  />
                  <span className="capitalize">{block.type}</span>
                  {hidden && <EyeOff className="h-3.5 w-3.5 text-gray-400 ml-1" />}
                  {hasMissing && (
                    <span className="h-2 w-2 rounded-full bg-amber-400 inline-block ml-1 shadow-sm" />
                  )}
                </span>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy
                    className="h-3.5 w-3.5 text-gray-400 hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(block);
                    }}
                  />
                  <Trash2
                    className="h-3.5 w-3.5 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(block.id);
                    }}
                  />
                </div>
              </button>
              {block.children && block.children.length > 0 && (
                <OutlineList
                  blocks={block.children}
                  depth={depth + 1}
                  selectedId={selectedId}
                  device={device}
                  lang={lang}
                  onSelect={onSelect}
                  onRemove={onRemove}
                  onDuplicate={onDuplicate}
                />
              )}
            </li>
          );
        })}
    </ul>
  );
}
