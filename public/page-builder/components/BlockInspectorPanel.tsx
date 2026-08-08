import { ArrowLeft, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type {
  Block,
  Device,
  DeviceVisibility,
  ResponsiveOverrides,
  I18nProps,
  AdvancedStyle,
} from '../types';
import { getBlockDefinition } from '../core/registry';
import { AdvancedStylePanel } from './AdvancedStylePanel';

type PanelTab = 'content' | 'style' | 'advanced';

export type BlockInspectorPanelProps = {
  block: Block;
  panelTab: PanelTab;
  onPanelTabChange: (tab: PanelTab) => void;
  currentLang: string;
  device: Device;
  onDeviceChange: (device: Device) => void;
  onBack: () => void;
  onChangeI18n: (i18n: I18nProps) => void;
  onChangeSharedProp: (key: string, value: string) => void;
  onChangeStyle: (style: AdvancedStyle) => void;
  onVisibilityChange: (visibility: DeviceVisibility) => void;
  onResponsiveStyleChange: (responsiveStyle: ResponsiveOverrides) => void;
  onRemove: () => void;
};

export function BlockInspectorPanel({
  block,
  panelTab,
  onPanelTabChange,
  currentLang,
  device,
  onDeviceChange,
  onBack,
  onChangeI18n,
  onChangeSharedProp,
  onChangeStyle,
  onVisibilityChange,
  onResponsiveStyleChange,
  onRemove,
}: BlockInspectorPanelProps) {
  const def = getBlockDefinition(block.type);
  const RegistryContentFields = def?.ContentFields;

  return (
    <>
      <div className="flex items-center gap-1.5 border-b border-gray-100 px-2 py-2">
        <button
          onClick={onBack}
          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-medium capitalize text-gray-700">{block.type}</span>
      </div>
      <Tabs
        value={panelTab}
        onValueChange={(v) => onPanelTabChange(v as PanelTab)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="border-b border-gray-100 px-2 pt-1.5 pb-1.5">
          <TabsList className="h-8 w-full bg-gray-100/50 p-1 grid grid-cols-3 rounded-lg">
            <TabsTrigger
              value="content"
              className="h-6 text-[11px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="style"
              className="h-6 text-[11px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Style
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="h-6 text-[11px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Advanced
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="content"
          className="m-0 flex-1 overflow-hidden data-[state=active]:flex flex-col"
        >
          <ScrollArea className="h-full">
            <div className="p-3">
              {RegistryContentFields ? (
                <RegistryContentFields
                  block={block}
                  activeLang={currentLang}
                  onChangeShared={onChangeSharedProp}
                  onChangeI18n={onChangeI18n}
                />
              ) : (
                <p className="text-[11px] text-gray-400">No content fields for this block type.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent
          value="style"
          className="m-0 flex-1 overflow-hidden data-[state=active]:flex flex-col"
        >
          <ScrollArea className="h-full">
            <AdvancedStylePanel
              block={block}
              device={device}
              setDevice={onDeviceChange}
              tab="style"
              onChange={onChangeStyle}
              onVisibilityChange={onVisibilityChange}
              onResponsiveStyleChange={onResponsiveStyleChange}
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent
          value="advanced"
          className="m-0 flex-1 overflow-hidden data-[state=active]:flex flex-col"
        >
          <ScrollArea className="h-full">
            <AdvancedStylePanel
              block={block}
              device={device}
              setDevice={onDeviceChange}
              tab="advanced"
              onChange={onChangeStyle}
              onVisibilityChange={onVisibilityChange}
              onResponsiveStyleChange={onResponsiveStyleChange}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <div className="border-t border-gray-100 p-2">
        <button
          onClick={onRemove}
          className="flex w-full items-center justify-center gap-1.5 rounded border border-gray-100 py-1.5 text-[11px] text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-3 w-3" /> Delete block
        </button>
      </div>
    </>
  );
}
