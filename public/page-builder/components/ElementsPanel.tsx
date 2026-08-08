import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Category } from '../types';
import { COMPONENT_LIBRARY, CATEGORY_LABEL } from '../constants';

export type ElementsPanelProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filteredLibrary: (typeof COMPONENT_LIBRARY)[number][];
  onStartDragNew: (def: (typeof COMPONENT_LIBRARY)[number], e: React.PointerEvent) => void;
};

export function ElementsPanel({
  search,
  onSearchChange,
  filteredLibrary,
  onStartDragNew,
}: ElementsPanelProps) {
  return (
    <>
      <div className="border-b border-gray-100 px-2 py-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-gray-300" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search…"
            className="h-7 border-gray-100 pl-7 text-[11px] focus-visible:ring-0"
          />
        </div>
      </div>
      <ScrollArea className="h-full">
        <Accordion
          type="multiple"
          defaultValue={['layout', 'basic', 'embeds']}
          className="px-2 pb-12"
        >
          {(['layout', 'basic', 'marketing', 'embeds'] as Category[]).map((cat) => {
            const items = filteredLibrary.filter((c) => c.category === cat);
            if (!items.length) return null;
            return (
              <AccordionItem key={cat} value={cat} className="border-gray-100">
                <AccordionTrigger className="py-2 text-[11px] font-medium text-gray-400 uppercase tracking-wide hover:no-underline">
                  {CATEGORY_LABEL[cat]}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-1.5 pb-2">
                    {items.map((comp) => {
                      const Icon = comp.icon;
                      return (
                        <div
                          key={comp.type}
                          onPointerDown={(e) => onStartDragNew(comp, e)}
                          className="flex cursor-grab select-none touch-none flex-col items-center gap-1 rounded border border-gray-100 bg-gray-50 px-1 py-3 text-center transition-colors hover:border-gray-200 hover:bg-white active:cursor-grabbing"
                        >
                          <Icon className="h-4 w-4 text-gray-400" />
                          <span className="text-[11px] text-gray-500">{comp.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
          {filteredLibrary.length === 0 && (
            <p className="py-4 text-center text-[11px] text-gray-400">No results for "{search}"</p>
          )}
        </Accordion>
      </ScrollArea>
    </>
  );
}
