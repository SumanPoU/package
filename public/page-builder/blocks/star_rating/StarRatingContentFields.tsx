import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Block } from '../../types';
import type { OnChangeI18n, OnChangeShared } from '../../core/types';

export function StarRatingContentFields({
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
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
          Rating <span className="ml-1 text-gray-300 normal-case font-normal">(shared)</span>
        </Label>
        <Input
          type="number"
          step="0.5"
          min="0"
          max={block.props.maxRating || '5'}
          value={block.props.rating ?? '4'}
          onChange={(e) => onChangeShared('rating', e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
          Max Rating <span className="ml-1 text-gray-300 normal-case font-normal">(shared)</span>
        </Label>
        <Input
          type="number"
          min="1"
          value={block.props.maxRating ?? '5'}
          onChange={(e) => onChangeShared('maxRating', e.target.value)}
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}
