import { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { POPULAR_ICONS } from './Icons';

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return POPULAR_ICONS.filter((i) => i.toLowerCase().includes(term));
  }, [search]);

  const CurrentIcon = (LucideIcons as any)[value] || LucideIcons.Smile;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-8 px-2 text-sm">
          <span className="flex items-center gap-2 truncate">
            <CurrentIcon className="w-4 h-4 text-gray-500" />
            <span className="truncate">{value || 'Select icon'}</span>
          </span>
          <LucideIcons.ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="relative mb-2">
          <LucideIcons.Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons..."
            className="h-7 pl-7 text-[11px]"
          />
        </div>
        <ScrollArea className="h-48">
          <div className="grid grid-cols-4 gap-1 p-1">
            {filtered.map((iconName) => {
              const Icon = (LucideIcons as any)[iconName];
              if (!Icon) return null;
              return (
                <button
                  key={iconName}
                  onClick={() => onChange(iconName)}
                  title={iconName}
                  className={cn(
                    'flex items-center justify-center p-2 rounded hover:bg-gray-100 transition-colors',
                    value === iconName && 'bg-primary/10 text-primary',
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-[11px] text-gray-400 py-4">No icons found.</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
