import { useMemo } from 'react';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Block, Device } from '../types';
import { collectAllBlockCssRules } from '../utils';
import { isRegisteredBlockType } from '../core/registry';
import { BlockNode, type DragPayload, type HoverTarget } from './BlockNode';

export type CanvasAreaProps = {
  blocks: Block[];
  device: Device;
  /** English-derived slug shown in device chrome; stable across language switches. */
  pageSlug: string;
  drag: DragPayload | null;
  hover: HoverTarget;
  selectedId: string | null;
  currentLang: string;
  isDraggingOverRoot: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDeselectBlock: () => void;
  onSelectBlock: (id: string) => void;
  onStartMove: (blockId: string, label: string, e: React.PointerEvent) => void;
  onRemoveBlock: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
};

export function CanvasArea({
  blocks,
  device,
  pageSlug,
  drag,
  hover,
  selectedId,
  currentLang,
  isDraggingOverRoot,
  canvasRef,
  onDeselectBlock,
  onSelectBlock,
  onStartMove,
  onRemoveBlock,
  registerRef,
}: CanvasAreaProps) {
  const blockCss = useMemo(
    () => collectAllBlockCssRules(blocks, { mode: 'canvas', device }),
    [blocks, device],
  );

  return (
    <main className="relative flex flex-1 flex-col overflow-auto bg-[#f4f4f5]">
      <div
        className={cn(
          'flex flex-1 flex-col',
          device === 'desktop' && 'py-2',
          device !== 'desktop' && 'items-center py-2',
        )}
      >
        <div
          className={cn(
            'relative flex flex-col bg-white transition-all duration-200',
            device === 'desktop' && 'mx-2 rounded-xs border border-gray-200 shadow-sm flex-1',
            device === 'tablet' &&
              'w-[768px] min-h-full rounded-lg border border-gray-200 shadow-lg',
            device === 'mobile' &&
              'w-[390px] min-h-full rounded-xl border border-gray-200 shadow-lg',
          )}
        >
          {device !== 'desktop' && (
            <div className="flex shrink-0 items-center gap-1.5 border-b border-gray-100 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-gray-200" />
              <div className="h-2 w-2 rounded-full bg-gray-200" />
              <div className="h-2 w-2 rounded-full bg-gray-200" />
              <div className="mx-2 flex-1 rounded bg-gray-100 px-2 py-0.5 text-center text-[10px] text-gray-400">
                /{pageSlug}
              </div>
            </div>
          )}
          <div
            ref={canvasRef}
            data-dropzone="root"
            onClick={onDeselectBlock}
            className={cn(
              'relative flex flex-1 flex-col overflow-x-auto transition-colors',
              isDraggingOverRoot && 'bg-primary/5',
            )}
            style={{ minHeight: device === 'desktop' ? '500px' : '600px' }}
          >
            {blockCss.length > 0 && (
              <style dangerouslySetInnerHTML={{ __html: blockCss.join('\n') }} />
            )}
            {blocks.length === 0 && !drag && (
              <div className="flex flex-1 flex-col items-center justify-center pointer-events-none select-none">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <LayoutGrid className="h-5 w-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">Drag a widget here to get started</p>
                  <p className="text-[11px] text-gray-300">Pick any element from the left panel</p>
                </div>
              </div>
            )}
            {blocks.length === 0 && drag && (
              <div className="flex flex-1 items-center justify-center pointer-events-none">
                <div className="h-full w-full border-2 border-dashed border-primary/40 bg-primary/10 flex items-center justify-center rounded">
                  <p className="text-sm text-primary/80">Drop here</p>
                </div>
              </div>
            )}
            {drag && hover?.containerId === 'root' && hover.index === 0 && blocks.length > 0 && (
              <div className="h-0.5 rounded-full bg-primary/80 mx-3 mt-1" />
            )}
            {blocks
              .filter((block) => isRegisteredBlockType(block.type))
              .map((block, index) => (
                <div key={block.id}>
                  <BlockNode
                    block={block}
                    drag={drag}
                    hover={hover}
                    selectedId={selectedId}
                    device={device}
                    depth={0}
                    lang={currentLang}
                    onSelect={onSelectBlock}
                    onStartMove={onStartMove}
                    onRemove={onRemoveBlock}
                    registerRef={registerRef}
                  />
                  {drag && hover?.containerId === 'root' && hover.index === index + 1 && (
                    <div className="h-0.5 rounded-full bg-primary/80 mx-3 my-0.5" />
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
