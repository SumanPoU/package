import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Block } from '../../types';
import type { OnChangeI18n, OnChangeShared } from '../../core/types';

export function IframeContentFields({
  block,
  activeLang: _activeLang,
  onChangeShared,
  onChangeI18n: _onChangeI18n,
}: {
  block: Block;
  activeLang: string;
  onChangeShared: OnChangeShared;
  onChangeI18n: OnChangeI18n;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
        Iframe URL <span className="ml-1 text-gray-300 normal-case font-normal">(shared)</span>
      </Label>
      <Input
        value={block.props.url ?? ''}
        onChange={(e) => onChangeShared('url', e.target.value)}
        className="h-8 text-sm"
      />
    </div>
  );
}
