import type { Block } from '../../types';
import type { OnChangeI18n, OnChangeShared } from '../../core/types';

export function ContainerContentFields({
  block: _block,
  activeLang: _activeLang,
  onChangeShared: _onChangeShared,
  onChangeI18n: _onChangeI18n,
}: {
  block: Block;
  activeLang: string;
  onChangeShared: OnChangeShared;
  onChangeI18n: OnChangeI18n;
}) {
  return (
    <p className="text-[11px] text-gray-400">
      Layout block — drop elements inside it on the canvas.
    </p>
  );
}
