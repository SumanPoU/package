import React, { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Block, Device } from '../types';
import { isContainerType, ALIGN_MAP } from '../constants';
import { blockClassName, effectiveStyle, resolveGridTemplateColumns } from '../utils';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { TRANSLATABLE_PROPS } from '../constants';
import { isRegisteredBlockType } from '../core/registry';
import { ElementRenderer } from '../elements/ElementRenderer';

type DragPayload = {
  kind: 'new' | 'move';
  type: Block['type'];
  blockId?: string;
  def?: any;
  label?: string;
};

type HoverTarget = {
  containerId: string;
  index: number;
} | null;

export function BlockNode({
  block,
  drag,
  hover,
  selectedId,
  device,
  depth,
  lang,
  onSelect,
  onStartMove,
  onRemove,
  registerRef,
}: {
  block: Block;
  drag: DragPayload | null;
  hover: HoverTarget;
  selectedId: string | null;
  device: Device;
  depth: number;
  lang: string;
  onSelect: (id: string) => void;
  onStartMove: (id: string, label: string, e: React.PointerEvent) => void;
  onRemove: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  if (!isRegisteredBlockType(block.type)) {
    if (import.meta.env.DEV) {
      console.warn(`[page-builder] Skipping unregistered block type "${block.type}" on canvas.`);
    }
    return null;
  }

  const [isHovered, setIsHovered] = useState(false);
  const isContainer = isContainerType(block.type);
  const isSelected = selectedId === block.id;
  const isDraggingThis = drag?.kind === 'move' && drag.blockId === block.id;
  const style = effectiveStyle(block, device);
  const isHidden = !block.visibility[device];
  const showToolbar = isSelected || isHovered;
  const hasMissingTranslation =
    SUPPORTED_LANGUAGES.length > 1 &&
    TRANSLATABLE_PROPS[block.type]?.some((k) => {
      const val = block.i18nProps[k]?.[lang];
      return !val?.trim();
    });

  return (
    <div
      ref={(el) => registerRef(block.id, el)}
      data-block-id={block.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
      style={{ zIndex: showToolbar ? 10 + depth : 'auto' }}
      className={cn(
        blockClassName(block.id),
        'relative min-w-0 max-w-full w-full transition-all',
        isSelected
          ? 'ring-2 ring-primary ring-inset'
          : isHovered
            ? 'ring-1 ring-primary/40 ring-inset ring-dashed'
            : '',
        isDraggingThis && 'opacity-40 grayscale',
        isHidden && 'opacity-40',
      )}
    >
      {hasMissingTranslation && !isContainer && (
        <div className="absolute top-1 left-1 z-20 h-1.5 w-1.5 rounded-full bg-amber-400" />
      )}
      {showToolbar && (
        <div
          className={cn(
            'absolute -top-[24px] right-0 z-50 flex items-center rounded-t-md px-1 shadow-sm transition-colors',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-white border border-b-0 border-gray-200 text-gray-500',
          )}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          <span
            className={cn(
              'px-2 text-[10px] font-semibold uppercase tracking-wider select-none',
              isSelected ? 'text-primary-foreground/90' : 'text-gray-400',
            )}
          >
            {block.type}
          </span>
          <div
            className={cn('w-px h-3 mx-1', isSelected ? 'bg-primary-foreground/40' : 'bg-gray-200')}
          />
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartMove(block.id, block.type, e);
            }}
            className={cn(
              'flex h-[24px] w-[24px] cursor-grab touch-none items-center justify-center active:cursor-grabbing',
              isSelected ? 'hover:text-white' : 'hover:text-gray-700',
            )}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(block.id);
            }}
            className={cn(
              'flex h-[24px] w-[24px] items-center justify-center',
              isSelected ? 'hover:text-red-200' : 'hover:text-red-500',
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {isContainer ? (
        <div className={cn(style.height !== 'auto' && 'h-full', isSelected && 'bg-primary/5')}>
          <div
            className={cn(
              style.width === 'boxed' ? 'max-w-7xl mx-auto px-6' : 'w-full',
              // Height classes
              style.height === 'full' && 'h-full',
              style.height === 'custom' && style.customHeight && 'h-auto',
            )}
            style={
              style.height === 'custom' && style.customHeight
                ? { height: `${style.customHeight}px` }
                : undefined
            }
          >
            <div
              data-dropzone={block.id}
              className={cn(
                'min-h-[56px] border border-dashed transition-colors',
                style.height !== 'auto' && 'h-full',
                drag && hover?.containerId === block.id
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-gray-200',
                block.type === 'flex' && 'flex flex-wrap p-2',
                block.type === 'grid' && 'grid p-2',
                block.type === 'container' && 'flex',
              )}
              style={{
                ...(block.type === 'grid' && {
                  gridTemplateColumns: resolveGridTemplateColumns(style),
                }),
                ...((block.type === 'flex' || block.type === 'container') && {
                  flexDirection:
                    (style.flexDirection as any) || (block.type === 'container' ? 'column' : 'row'),
                  justifyContent: style.justifyContent as any,
                  alignItems: style.alignItems as any,
                }),
                ...((block.type === 'flex' ||
                  block.type === 'container' ||
                  block.type === 'grid') &&
                  style.gap && {
                    gap: `${style.gap.row ?? 0}${style.gap.unit} ${style.gap.column ?? 0}${style.gap.unit}`,
                  }),
                ...((block.type === 'flex' || block.type === 'grid') &&
                  !style.gap && {
                    gap: '12px',
                  }),
              }}
            >
              {block.children!.length === 0 && (
                <div className="flex items-center justify-center py-4 col-span-full w-full pointer-events-none">
                  <p className="text-[11px] text-gray-400 select-none">
                    {block.type === 'grid'
                      ? 'Drop into grid'
                      : block.type === 'flex'
                        ? 'Drop into row'
                        : 'Drop into container'}
                  </p>
                </div>
              )}
              {drag &&
                hover?.containerId === block.id &&
                hover.index === 0 &&
                block.children!.length === 0 && (
                  <div className="absolute inset-0 border-2 border-dashed border-primary/50 bg-primary/5 pointer-events-none z-10" />
                )}
              {block
                .children!.filter((child) => isRegisteredBlockType(child.type))
                .map((child, i) => {
                  const isHoverTargetBefore =
                    drag && hover?.containerId === block.id && hover.index === i;
                  const isHoverTargetAfter =
                    drag &&
                    hover?.containerId === block.id &&
                    hover.index === i + 1 &&
                    i === block.children!.length - 1;
                  const isHorizontal = block.type === 'flex' || block.type === 'grid';

                  return (
                    <div key={child.id} className="relative min-w-0 max-w-full">
                      {isHoverTargetBefore && (
                        <div
                          className={cn(
                            'absolute z-10 bg-primary rounded-full pointer-events-none',
                            isHorizontal
                              ? '-left-[5px] top-0 bottom-0 w-1'
                              : '-top-[5px] left-0 right-0 h-1',
                          )}
                        />
                      )}
                      <BlockNode
                        block={child}
                        drag={drag}
                        hover={hover}
                        selectedId={selectedId}
                        device={device}
                        depth={depth + 1}
                        lang={lang}
                        onSelect={onSelect}
                        onStartMove={onStartMove}
                        onRemove={onRemove}
                        registerRef={registerRef}
                      />
                      {isHoverTargetAfter && (
                        <div
                          className={cn(
                            'absolute z-10 bg-primary rounded-full pointer-events-none',
                            isHorizontal
                              ? '-right-[5px] top-0 bottom-0 w-1'
                              : '-bottom-[5px] left-0 right-0 h-1',
                          )}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className={cn('flex flex-col', ALIGN_MAP[style.align])}>
          <ElementRenderer block={block} lang={lang} />
        </div>
      )}
    </div>
  );
}

export type { DragPayload, HoverTarget };
