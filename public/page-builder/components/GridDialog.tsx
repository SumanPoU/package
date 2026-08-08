import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HoverTarget } from './BlockNode';
import { Block } from '../types';
import { COMPONENT_LIBRARY } from '../constants';
import { createBlock, insertBlockInTree } from '../utils';

export default function GridDialog({
  open,
  onOpenChange,
  pendingDrop,
  currentLang,
  setPendingDrop,
  setBlocksWithHistory,
  setSelectedId,
  setPanelTab,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingDrop: { target: NonNullable<HoverTarget>; def: (typeof COMPONENT_LIBRARY)[number] } | null;
  currentLang: string;
  setPendingDrop: (
    pendingDrop: {
      target: NonNullable<HoverTarget>;
      def: (typeof COMPONENT_LIBRARY)[number];
    } | null,
  ) => void;
  setBlocksWithHistory: (action: Block[] | ((b: Block[]) => Block[])) => void;
  setSelectedId: (id: string | null) => void;
  setPanelTab: (tab: 'content' | 'style' | 'advanced') => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Select Grid Structure</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            {
              label: '1 Column',
              cols: 1,
              template: '1fr',
              w1: '100%',
              w2: '0%',
              w3: '0%',
              w4: '0%',
            },
            {
              label: '2 Columns',
              cols: 2,
              template: '1fr 1fr',
              w1: '50%',
              w2: '50%',
              w3: '0%',
              w4: '0%',
            },
            {
              label: '3 Columns',
              cols: 3,
              template: '1fr 1fr 1fr',
              w1: '33.3%',
              w2: '33.3%',
              w3: '33.3%',
              w4: '0%',
            },
            {
              label: '4 Columns',
              cols: 4,
              template: '1fr 1fr 1fr 1fr',
              w1: '25%',
              w2: '25%',
              w3: '25%',
              w4: '25%',
            },
            {
              label: '5 Columns',
              cols: 5,
              template: '1fr 1fr 1fr 1fr 1fr',
              w1: '20%',
              w2: '20%',
              w3: '20%',
              w4: '20%',
              w5: '20%',
            },
            {
              label: '6 Columns',
              cols: 6,
              template: '1fr 1fr 1fr 1fr 1fr 1fr',
              w1: '16.6%',
              w2: '16.6%',
              w3: '16.6%',
              w4: '16.6%',
              w5: '16.6%',
              w6: '16.6%',
            },
            {
              label: 'Left Sidebar',
              cols: 2,
              template: '3fr 7fr',
              w1: '30%',
              w2: '70%',
              w3: '0%',
              w4: '0%',
            },
            {
              label: 'Right Sidebar',
              cols: 2,
              template: '7fr 3fr',
              w1: '70%',
              w2: '30%',
              w3: '0%',
              w4: '0%',
            },
          ].map((opt, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-3 rounded-xl border-2 border-gray-100 p-4 hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => {
                if (!pendingDrop) return;
                const nb = createBlock(pendingDrop.def as any, currentLang);
                nb.style.columns = opt.cols as any;
                nb.style.gridTemplateColumns = opt.template;
                const containerDef = COMPONENT_LIBRARY.find((c) => c.type === 'container')!;
                nb.children = Array.from({ length: opt.cols }).map(() =>
                  createBlock(containerDef as any, currentLang),
                );
                setBlocksWithHistory((p) =>
                  insertBlockInTree(
                    p,
                    pendingDrop.target.containerId,
                    pendingDrop.target.index,
                    nb,
                  ),
                );
                setSelectedId(nb.id);
                setPanelTab('style');
                setPendingDrop(null);
              }}
            >
              <div className="flex h-12 w-full gap-1 p-1 bg-gray-50 rounded-lg">
                {opt.cols >= 1 && (
                  <div className="h-full bg-primary/20 rounded" style={{ width: opt.w1 }} />
                )}
                {opt.cols >= 2 && (
                  <div className="h-full bg-primary/20 rounded" style={{ width: opt.w2 }} />
                )}
                {opt.cols >= 3 && (
                  <div className="h-full bg-primary/20 rounded" style={{ width: opt.w3 }} />
                )}
                {opt.cols >= 4 && (
                  <div className="h-full bg-primary/20 rounded" style={{ width: opt.w4 }} />
                )}
              </div>
              <span className="text-xs font-medium text-gray-600">{opt.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
