import { Monitor, Tablet, Smartphone, Settings, Check, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Device } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';

export type EditorHeaderProps = {
  pageName: string;
  /** Always English-derived; does not change when switching editor language. */
  pageSlug: string;
  onPageNameChange: (value: string) => void;
  device: Device;
  onDeviceChange: (device: Device) => void;
  onSettingsOpen: () => void;
  onPreview: () => void;
  onPublish: () => void;
  isPublishing: boolean;
  isEditMode: boolean;
  savedFlash: boolean;
};

export function EditorHeader({
  pageName,
  pageSlug,
  onPageNameChange,
  device,
  onDeviceChange,
  onSettingsOpen,
  onPreview,
  onPublish,
  isPublishing,
  isEditMode,
  savedFlash,
}: EditorHeaderProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-3 z-20">
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="h-5 w-5 shrink-0 rounded bg-gray-900" />
        <Input
          value={pageName}
          onChange={(e) => onPageNameChange(e.target.value)}
          className="h-7 w-36 border-transparent px-1.5 text-sm font-medium text-gray-800 shadow-none hover:border-gray-200 focus-visible:border-gray-200 focus-visible:ring-0"
        />
        <span className="text-[11px] text-gray-300 truncate max-w-[100px]">/{pageSlug}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onSettingsOpen}
              className="flex h-6 w-6 items-center justify-center rounded text-gray-300 hover:bg-gray-100 hover:text-gray-500"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Page settings</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-0.5 rounded border border-gray-100 bg-gray-50 p-0.5">
        {(
          [
            ['desktop', Monitor],
            ['tablet', Tablet],
            ['mobile', Smartphone],
          ] as const
        ).map(([d, Icon]) => (
          <Tooltip key={d}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDeviceChange(d)}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded transition-colors',
                  device === d
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="capitalize">{d}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <button
          onClick={onPreview}
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-800"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Preview
        </button>
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="flex h-7 items-center gap-1 rounded bg-gray-900 px-3 text-[12px] font-medium text-white hover:bg-gray-700 disabled:opacity-60"
        >
          {savedFlash ? (
            <>
              <Check className="h-3 w-3" /> Saved
            </>
          ) : isPublishing ? (
            isEditMode ? (
              'Updating…'
            ) : (
              'Publishing…'
            )
          ) : isEditMode ? (
            'Update'
          ) : (
            'Publish'
          )}
        </button>
      </div>
    </header>
  );
}
