import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { COLOR_PALETTE } from '../../constants';
import type { OnChangeShared } from '../../core/types';
import type { Block, Device } from '../../types';

import type { TextStyle } from './blog-card.types';
import { parseTextStyle, stringifyTextStyle } from './blog-card.styleUtils';

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-2.5 py-2 text-left bg-gray-50/80 hover:bg-gray-50"
      >
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          {title}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open ? <div className="space-y-2.5 p-2.5">{children}</div> : null}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value?.startsWith('#') && value.length >= 4 ? value.slice(0, 7) : '#111827'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 p-0.5 cursor-pointer"
        />
        <Input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#111827"
          className="h-8 text-sm flex-1"
        />
      </div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(11, 1fr)' }}>
        {COLOR_PALETTE.slice(0, 22).map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(c)}
            className="h-3.5 w-3.5 rounded-sm border border-black/10"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

function TextStyleEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: TextStyle) => void;
}) {
  const style = parseTextStyle(value);
  const patch = (key: keyof TextStyle, v: string) => {
    const next = { ...style };
    if (!v) delete next[key];
    else next[key] = v as never;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <ColorField label="Color" value={style.color ?? ''} onChange={(v) => patch('color', v)} />
      <div className="space-y-1">
        <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Font family</Label>
        <select
          value={style.fontFamily ?? ''}
          onChange={(e) => patch('fontFamily', e.target.value)}
          className="w-full h-8 text-sm border-gray-200 rounded-md"
        >
          <option value="">Default (inherit)</option>
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Poppins">Poppins</option>
          <option value="Oswald">Oswald</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Rubik">Rubik</option>
          <option value="Outfit">Outfit</option>
          <option value="Mukta">Mukta</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Font size</Label>
        <Input
          value={style.fontSize ?? ''}
          onChange={(e) => patch('fontSize', e.target.value)}
          placeholder="e.g. 1.25rem"
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Font weight</Label>
        <select
          value={style.fontWeight ?? ''}
          onChange={(e) => patch('fontWeight', e.target.value)}
          className="w-full h-8 text-sm border-gray-200 rounded-md"
        >
          <option value="">Default</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Align</Label>
        <select
          value={style.textAlign ?? ''}
          onChange={(e) => patch('textAlign', e.target.value)}
          className="w-full h-8 text-sm border-gray-200 rounded-md"
        >
          <option value="">Default</option>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Transform</Label>
        <select
          value={style.textTransform ?? ''}
          onChange={(e) => patch('textTransform', e.target.value)}
          className="w-full h-8 text-sm border-gray-200 rounded-md"
        >
          <option value="">Default</option>
          <option value="none">None</option>
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="capitalize">Capitalize</option>
        </select>
      </div>
    </div>
  );
}

/**
 * Block-specific style panel. `onChangeShared` is optional in the registry type
 * (`StyleFields` only declares block+device); pass it when the inspector is wired.
 */
export function BlogCardStyleFields({
  block,
  device: _device,
  onChangeShared,
}: {
  block: Block;
  device: Device;
  onChangeShared?: OnChangeShared;
}) {
  if (!onChangeShared) {
    return (
      <p className="text-[11px] text-gray-400 p-3">
        Card style controls are registered but not yet wired into the inspector Style tab.
      </p>
    );
  }

  const setStyleProp = (key: string, style: TextStyle) => {
    onChangeShared(key, stringifyTextStyle(style));
  };

  return (
    <div className="space-y-2 p-3">
      <Section title="Card" defaultOpen>
        <ColorField
          label="Background"
          value={block.props.cardBackgroundColor ?? '#ffffff'}
          onChange={(v) => onChangeShared('cardBackgroundColor', v)}
        />
        <ColorField
          label="Border"
          value={block.props.cardBorderColor ?? '#e5e7eb'}
          onChange={(v) => onChangeShared('cardBorderColor', v)}
        />
        <div className="space-y-1">
          <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Radius</Label>
          <Input
            value={block.props.cardBorderRadius ?? '12px'}
            onChange={(e) => onChangeShared('cardBorderRadius', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Padding</Label>
          <Input
            value={block.props.cardPadding ?? '20px'}
            onChange={(e) => onChangeShared('cardPadding', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Shadow</Label>
          <select
            value={block.props.cardShadow || 'sm'}
            onChange={(e) => onChangeShared('cardShadow', e.target.value)}
            className="w-full h-8 text-sm border-gray-200 rounded-md"
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-gray-400 uppercase tracking-wide">Hover effect</Label>
          <select
            value={block.props.hoverEffect || 'lift'}
            onChange={(e) => onChangeShared('hoverEffect', e.target.value)}
            className="w-full h-8 text-sm border-gray-200 rounded-md"
          >
            <option value="none">None</option>
            <option value="lift">Lift</option>
            <option value="zoom-image">Zoom image</option>
            <option value="shadow-grow">Shadow grow</option>
          </select>
        </div>
      </Section>

      <Section title="Title">
        <TextStyleEditor
          value={block.props.titleStyle}
          onChange={(s) => setStyleProp('titleStyle', s)}
        />
      </Section>
      <Section title="Excerpt">
        <TextStyleEditor
          value={block.props.excerptStyle}
          onChange={(s) => setStyleProp('excerptStyle', s)}
        />
      </Section>
      <Section title="Author & Date">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Author</p>
        <TextStyleEditor
          value={block.props.authorStyle}
          onChange={(s) => setStyleProp('authorStyle', s)}
        />
        <p className="text-[10px] text-gray-400 uppercase tracking-wide pt-1">Date</p>
        <TextStyleEditor
          value={block.props.dateStyle}
          onChange={(s) => setStyleProp('dateStyle', s)}
        />
      </Section>
      <Section title="Category badge">
        <TextStyleEditor
          value={block.props.categoryStyle}
          onChange={(s) => setStyleProp('categoryStyle', s)}
        />
      </Section>
      <Section title="Read more link">
        <TextStyleEditor
          value={block.props.readMoreStyle}
          onChange={(s) => setStyleProp('readMoreStyle', s)}
        />
      </Section>
    </div>
  );
}
