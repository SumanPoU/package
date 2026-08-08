import { Layers, LayoutGrid } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Block, Device } from '../types';
import { COMPONENT_LIBRARY } from '../constants';
import { BlockInspectorPanel } from './BlockInspectorPanel';
import { ElementsPanel } from './ElementsPanel';
import { OutlineList } from './OutlineList';

type PanelTab = 'content' | 'style' | 'advanced';
type LeftTab = 'elements' | 'outline';

export type LeftSidebarProps = {
  selectedBlock: Block | null;
  panelTab: PanelTab;
  onPanelTabChange: (tab: PanelTab) => void;
  leftTab: LeftTab;
  onLeftTabChange: (tab: LeftTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filteredLibrary: (typeof COMPONENT_LIBRARY)[number][];
  blocks: Block[];
  selectedId: string | null;
  device: Device;
  currentLang: string;
  onSelectBlock: (id: string) => void;
  onDeselectBlock: () => void;
  onDeviceChange: (device: Device) => void;
  onStartDragNew: (def: (typeof COMPONENT_LIBRARY)[number], e: React.PointerEvent) => void;
  onRemoveBlock: (id: string) => void;
  onDuplicateBlock: (block: Block) => void;
  onChangeI18n: (id: string, i18n: Block['i18nProps']) => void;
  onChangeSharedProp: (id: string, key: string, value: string) => void;
  onChangeStyle: (id: string, style: Block['style']) => void;
  onVisibilityChange: (id: string, visibility: Block['visibility']) => void;
  onResponsiveStyleChange: (id: string, responsiveStyle: Block['responsiveStyle']) => void;
};

export function LeftSidebar({
  selectedBlock,
  panelTab,
  onPanelTabChange,
  leftTab,
  onLeftTabChange,
  search,
  onSearchChange,
  filteredLibrary,
  blocks,
  selectedId,
  device,
  currentLang,
  onSelectBlock,
  onDeselectBlock,
  onDeviceChange,
  onStartDragNew,
  onRemoveBlock,
  onDuplicateBlock,
  onChangeI18n,
  onChangeSharedProp,
  onChangeStyle,
  onVisibilityChange,
  onResponsiveStyleChange,
}: LeftSidebarProps) {
  return (
    <aside className="flex w-68 shrink-0 flex-col border-r border-gray-100 bg-white overflow-hidden">
      {selectedBlock ? (
        <BlockInspectorPanel
          block={selectedBlock}
          panelTab={panelTab}
          onPanelTabChange={onPanelTabChange}
          currentLang={currentLang}
          device={device}
          onDeviceChange={onDeviceChange}
          onBack={onDeselectBlock}
          onChangeI18n={(i18n) => onChangeI18n(selectedBlock.id, i18n)}
          onChangeSharedProp={(key, val) => onChangeSharedProp(selectedBlock.id, key, val)}
          onChangeStyle={(s) => onChangeStyle(selectedBlock.id, s)}
          onVisibilityChange={(v) => onVisibilityChange(selectedBlock.id, v)}
          onResponsiveStyleChange={(rs) => onResponsiveStyleChange(selectedBlock.id, rs)}
          onRemove={() => onRemoveBlock(selectedBlock.id)}
        />
      ) : (
        <Tabs
          value={leftTab}
          onValueChange={(v) => onLeftTabChange(v as LeftTab)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="border-b border-gray-100 px-2 pt-1.5">
            <TabsList className="h-7 w-full bg-gray-100 p-0.5">
              <TabsTrigger value="elements" className="flex-1 h-6 gap-1 text-[11px]">
                <LayoutGrid className="h-3 w-3" /> Elements
              </TabsTrigger>
              <TabsTrigger value="outline" className="flex-1 h-6 gap-1 text-[11px]">
                <Layers className="h-3 w-3" /> Outline
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="elements" className="m-0 flex-1 overflow-hidden">
            <ElementsPanel
              search={search}
              onSearchChange={onSearchChange}
              filteredLibrary={filteredLibrary}
              onStartDragNew={onStartDragNew}
            />
          </TabsContent>
          <TabsContent value="outline" className="m-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2">
                {blocks.length === 0 ? (
                  <p className="py-4 text-center text-[11px] text-gray-400">No blocks yet.</p>
                ) : (
                  <OutlineList
                    blocks={blocks}
                    depth={0}
                    selectedId={selectedId}
                    device={device}
                    lang={currentLang}
                    onSelect={onSelectBlock}
                    onRemove={onRemoveBlock}
                    onDuplicate={onDuplicateBlock}
                  />
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </aside>
  );
}
