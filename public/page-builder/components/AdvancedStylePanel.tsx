import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  RotateCcw,
  Link2,
  Unlink2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignVerticalSpaceBetween,
  AlignVerticalSpaceAround,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import {
  AdvancedStyle,
  SpacingValue,
  SpacingUnit,
  BorderRadiusValue,
  BoxShadow,
  Block,
  Device,
  DeviceVisibility,
  ResponsiveOverrides,
  GapValue,
} from '../types';
import { COLOR_PALETTE, DEVICES, isContainerType } from '../constants';
import {
  IMAGE_OBJECT_FIT_OPTIONS,
  IMAGE_SHADOW_PRESETS,
  type ImageShadowPreset,
} from '../lib/imageStyle';
import { effectiveStyle } from '../utils';

function ColorPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value || '');
  const [inputVal, setInputVal] = useState(value || '');
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHex(value || '');
    setInputVal(value || '');
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const reposition = () => {
      if (!swatchRef.current) return;
      const rect = swatchRef.current.getBoundingClientRect();
      const dropH = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow > dropH ? rect.bottom + 4 : rect.top - dropH - 4;
      setDropdownPos({ top, left: rect.left, width: Math.max(220, rect.width + 160) });
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      const dropH = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow > dropH ? rect.bottom + 4 : rect.top - dropH - 4;
      setDropdownPos({ top, left: rect.left, width: Math.max(220, rect.width + 160) });
    }
    setOpen((prev) => !prev);
  };

  const handleHexChange = (v: string) => {
    setInputVal(v);
    const clean = v.startsWith('#') ? v : '#' + v;
    if (
      /^#[0-9a-fA-F]{3}$/.test(clean) ||
      /^#[0-9a-fA-F]{6}$/.test(clean) ||
      /^#[0-9a-fA-F]{8}$/.test(clean)
    ) {
      setHex(clean);
      onChange(clean);
    }
  };

  const displayColor = hex || '#ffffff';

  const dropdown =
    open && dropdownPos
      ? createPortal(
          <div
            ref={pickerRef}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 99999,
            }}
            className="rounded border border-gray-200 bg-white p-2 shadow-2xl space-y-2"
          >
            <input
              type="color"
              value={displayColor.slice(0, 7)}
              onChange={(e) => {
                setHex(e.target.value);
                setInputVal(e.target.value);
                onChange(e.target.value);
              }}
              className="w-full h-8 rounded cursor-pointer border-0"
            />
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(11, 1fr)' }}>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  title={c}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHex(c);
                    setInputVal(c);
                    onChange(c);
                    setOpen(false);
                  }}
                  className="h-4 w-4 rounded-sm border border-black/10 transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</Label>
      )}
      <div className="flex items-center gap-2">
        <button
          ref={swatchRef}
          onClick={handleToggle}
          className="h-7 w-7 rounded border border-gray-300 shadow-sm shrink-0 relative overflow-hidden"
          title="Pick color"
          style={{
            background: hex
              ? hex
              : 'linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,white 25%,white 75%,#ccc 75%)',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0,4px 4px',
          }}
        >
          {hex && <div className="absolute inset-0" style={{ backgroundColor: hex }} />}
        </button>
        <input
          value={inputVal}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#000000"
          className="h-7 flex-1 rounded border border-gray-200 px-2 text-[11px] font-mono text-gray-700 focus:outline-none focus:border-gray-400"
        />
        {hex && (
          <button
            onClick={() => {
              setHex('');
              setInputVal('');
              onChange('');
            }}
            className="text-gray-300 hover:text-gray-500"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
      {dropdown}
    </div>
  );
}

function GapInput({
  label,
  value,
  onChange,
  device,
  setDevice,
}: {
  label: string;
  value: GapValue;
  onChange: (v: GapValue) => void;
  device: Device;
  setDevice: (d: Device) => void;
}) {
  const update = (k: keyof GapValue, val: any) => onChange({ ...value, [k]: val });

  const handleNumChange = (k: 'row' | 'column', val: string) => {
    const parsed = val === '' ? null : Number(val);
    if (value.linked) {
      onChange({ ...value, row: parsed, column: parsed });
    } else {
      update(k, parsed);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</Label>
        <div className="flex items-center gap-1.5">
          <select
            value={value.unit}
            onChange={(e) => update('unit', e.target.value)}
            className="bg-transparent text-[10px] text-gray-500 focus:outline-none cursor-pointer"
          >
            <option value="px">px</option>
            <option value="em">em</option>
            <option value="rem">rem</option>
            <option value="vw">vw</option>
            <option value="vh">vh</option>
          </select>
          <div className="flex gap-0.5 ml-1">
            {DEVICES.map((d) => {
              const DevIcon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
              return (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={cn(
                    'rounded p-0.5 transition-colors',
                    device === d
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-400 hover:text-gray-600',
                  )}
                >
                  <DevIcon className="h-2.5 w-2.5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center rounded border border-gray-200 bg-white shadow-sm overflow-hidden focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <div className="flex-1 flex flex-col items-center py-1">
          <input
            type="number"
            value={value.column ?? ''}
            onChange={(e) => handleNumChange('column', e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-center text-[12px] focus:outline-none hide-spin-button"
          />
          <span className="text-[9px] text-gray-400 font-medium">Column</span>
        </div>
        <div className="w-[1px] h-6 bg-gray-100" />
        <div className="flex-1 flex flex-col items-center py-1">
          <input
            type="number"
            value={value.row ?? ''}
            onChange={(e) => handleNumChange('row', e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-center text-[12px] focus:outline-none hide-spin-button"
          />
          <span className="text-[9px] text-gray-400 font-medium">Row</span>
        </div>
        <button
          onClick={() => {
            const next = !value.linked;
            if (next) onChange({ ...value, linked: true, row: value.column });
            else update('linked', false);
          }}
          className={cn(
            'flex h-full px-2 items-center justify-center transition-colors border-l',
            value.linked
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600',
          )}
        >
          {value.linked ? <Link2 className="h-3 w-3" /> : <Unlink2 className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}

function FourDimInput({
  value,
  onChange,
  label,
  units,
  device,
  setDevice,
}: {
  value: SpacingValue;
  onChange: (v: SpacingValue) => void;
  label: string;
  units?: SpacingUnit[];
  device?: Device;
  setDevice?: (d: Device) => void;
}) {
  const availUnits = units ?? ['px', 'em', 'rem', '%'];
  const sides = ['top', 'right', 'bottom', 'left'] as const;
  const sideLabels = { top: 'T', right: 'R', bottom: 'B', left: 'L' };

  const update = (side: (typeof sides)[number], val: string) => {
    if (value.linked) {
      onChange({ ...value, top: val, right: val, bottom: val, left: val });
    } else {
      onChange({ ...value, [side]: val });
    }
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</Label>
          {device && setDevice && (
            <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded px-0.5 py-0.5">
              <button
                onClick={() => setDevice('desktop')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'desktop'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Monitor className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'tablet'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Tablet className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'mobile'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Smartphone className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <select
            value={value.unit}
            onChange={(e) => onChange({ ...value, unit: e.target.value as SpacingUnit })}
            className="h-5 rounded border border-gray-200 text-[10px] text-gray-500 px-0.5 focus:outline-none"
          >
            {availUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            onClick={() => onChange({ ...value, linked: !value.linked })}
            title={value.linked ? 'Unlink sides' : 'Link all sides'}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded border transition-colors',
              value.linked
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-gray-200 text-gray-300 hover:border-gray-400 hover:text-gray-500',
            )}
          >
            {value.linked ? <Link2 className="h-2.5 w-2.5" /> : <Unlink2 className="h-2.5 w-2.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {sides.map((side) => (
          <div key={side} className="flex flex-col items-center gap-0.5">
            <input
              value={value.linked && side !== 'top' ? value.top : value[side]}
              onChange={(e) => update(side, e.target.value)}
              placeholder="—"
              className="h-7 w-full rounded border border-gray-200 text-center text-[11px] font-mono text-gray-700 focus:border-primary/50 focus:outline-none"
            />
            <span className="text-[9px] text-gray-300">{sideLabels[side]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BorderRadiusInput({
  value,
  onChange,
}: {
  value: BorderRadiusValue;
  onChange: (v: BorderRadiusValue) => void;
}) {
  const corners = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const;
  const cornerLabels = { topLeft: '↖', topRight: '↗', bottomRight: '↘', bottomLeft: '↙' };

  const update = (corner: (typeof corners)[number], val: string) => {
    if (value.linked) {
      onChange({ ...value, topLeft: val, topRight: val, bottomRight: val, bottomLeft: val });
    } else {
      onChange({ ...value, [corner]: val });
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Radius</Label>
        <div className="flex items-center gap-1">
          <select
            value={value.unit}
            onChange={(e) =>
              onChange({ ...value, unit: e.target.value as BorderRadiusValue['unit'] })
            }
            className="h-5 rounded border border-gray-200 text-[10px] text-gray-500 px-0.5 focus:outline-none"
          >
            {(['px', 'em', '%'] as const).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            onClick={() => onChange({ ...value, linked: !value.linked })}
            title={value.linked ? 'Unlink' : 'Link all'}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded border transition-colors',
              value.linked
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-gray-200 text-gray-300 hover:border-gray-400',
            )}
          >
            {value.linked ? <Link2 className="h-2.5 w-2.5" /> : <Unlink2 className="h-2.5 w-2.5" />}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {corners.map((c) => (
          <div key={c} className="flex flex-col items-center gap-0.5">
            <input
              value={value.linked && c !== 'topLeft' ? value.topLeft : value[c]}
              onChange={(e) => update(c, e.target.value)}
              placeholder="—"
              className="h-7 w-full rounded border border-gray-200 text-center text-[11px] font-mono text-gray-700 focus:border-primary/50 focus:outline-none"
            />
            <span className="text-[9px] text-gray-300">{cornerLabels[c]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumUnitInput({
  value,
  unit,
  onValue,
  onUnit,
  units,
  placeholder,
  label,
  device,
  setDevice,
}: {
  value: string;
  unit: string;
  onValue: (v: string) => void;
  onUnit: (u: string) => void;
  units: string[];
  placeholder?: string;
  label?: string;
  device?: Device;
  setDevice?: (d: Device) => void;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center gap-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</Label>
          {device && setDevice && (
            <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded px-0.5 py-0.5">
              <button
                onClick={() => setDevice('desktop')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'desktop'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Monitor className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'tablet'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Tablet className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'mobile'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Smartphone className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-1">
        <input
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder={placeholder ?? '—'}
          className="h-7 flex-1 rounded border border-gray-200 px-2 text-[11px] font-mono text-gray-700 focus:border-primary/50 focus:outline-none"
        />
        <select
          value={unit}
          onChange={(e) => onUnit(e.target.value)}
          className="h-7 rounded border border-gray-200 text-[10px] text-gray-500 px-1 focus:outline-none"
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function DimensionInput({
  value,
  onChange,
  units,
  placeholder,
  label,
  device,
  setDevice,
}: {
  value: { value: number | null; unit: string };
  onChange: (v: { value: number | null; unit: string }) => void;
  units: string[];
  placeholder?: string;
  label?: string;
  device?: Device;
  setDevice?: (d: Device) => void;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center gap-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</Label>
          {device && setDevice && (
            <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded px-0.5 py-0.5">
              <button
                onClick={() => setDevice('desktop')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'desktop'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Monitor className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'tablet'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Tablet className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={cn(
                  'p-0.5 rounded',
                  device === 'mobile'
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Smartphone className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-1">
        <input
          type="number"
          value={value?.value ?? ''}
          onChange={(e) =>
            onChange({ ...value, value: e.target.value ? Number(e.target.value) : null })
          }
          placeholder={value?.unit === 'auto' ? 'auto' : (placeholder ?? '—')}
          disabled={value?.unit === 'auto'}
          className="h-7 flex-1 rounded border border-gray-200 px-2 text-[11px] font-mono text-gray-700 focus:border-primary/50 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
        />
        <select
          value={value?.unit ?? 'auto'}
          onChange={(e) => {
            const u = e.target.value;
            onChange({ ...value, unit: u, value: u === 'auto' ? null : value?.value });
          }}
          className="h-7 rounded border border-gray-200 text-[10px] text-gray-500 px-1 focus:outline-none"
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function BoxShadowPanel({
  shadow,
  onChange,
}: {
  shadow: BoxShadow;
  onChange: (s: BoxShadow) => void;
}) {
  const [enabled, setEnabled] = useState(shadow.enabled);

  useEffect(() => {
    setEnabled(shadow.enabled);
  }, [shadow.enabled]);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    onChange({ ...shadow, enabled: next });
  };

  const updateField = (key: keyof BoxShadow, val: string | boolean) => {
    onChange({ ...shadow, enabled, [key]: val });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Box shadow</Label>
        <button
          onClick={handleToggle}
          className={cn(
            'relative inline-flex h-4 w-7 items-center rounded-full transition-colors',
            enabled ? 'bg-primary' : 'bg-gray-200',
          )}
        >
          <span
            className={cn(
              'inline-block h-3 w-3 rounded-full bg-white transition-transform',
              enabled ? 'translate-x-3.5' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>
      <div
        style={{
          maxHeight: enabled ? '400px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.2s ease',
        }}
      >
        <div className="space-y-2 rounded border border-gray-100 bg-gray-50 p-2">
          <div className="grid grid-cols-2 gap-2">
            {(['x', 'y', 'blur', 'spread'] as const).map((k) => {
              const labels = { x: 'X offset', y: 'Y offset', blur: 'Blur', spread: 'Spread' };
              return (
                <div key={k} className="space-y-0.5">
                  <Label className="text-[9px] text-gray-400 uppercase tracking-wide">
                    {labels[k]}
                  </Label>
                  <div className="flex items-center">
                    <input
                      value={shadow[k]}
                      onChange={(e) => updateField(k, e.target.value)}
                      className="h-6 w-full rounded border border-gray-200 px-1.5 text-[11px] font-mono text-gray-700 focus:outline-none"
                    />
                    <span className="ml-1 text-[9px] text-gray-400">px</span>
                  </div>
                </div>
              );
            })}
          </div>
          <ColorPicker
            label="Shadow color"
            value={shadow.color}
            onChange={(v) => updateField('color', v)}
          />
          <label className="flex items-center gap-1.5 text-[11px] text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={shadow.inset}
              onChange={(e) => updateField('inset', e.target.checked)}
              className="accent-primary"
            />
            Inset
          </label>
          <div className="flex items-center justify-center h-10 rounded bg-white border border-gray-200">
            <div
              className="h-5 w-16 rounded bg-gray-200"
              style={{
                boxShadow: `${shadow.inset ? 'inset ' : ''}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdvancedStylePanel({
  block,
  device,
  setDevice,
  onChange,
  onVisibilityChange,
  onResponsiveStyleChange,
  tab,
}: {
  block: Block;
  device: Device;
  setDevice: (d: Device) => void;
  onChange: (s: AdvancedStyle) => void;
  onVisibilityChange: (vis: DeviceVisibility) => void;
  onResponsiveStyleChange: (rs: ResponsiveOverrides) => void;
  tab?: 'style' | 'advanced';
}) {
  const active = effectiveStyle(block, device);
  const isBase = device === 'desktop';
  const hasOverride = !!block.responsiveStyle[device];
  const updateBase = <K extends keyof AdvancedStyle>(key: K, value: AdvancedStyle[K]) =>
    onChange({ ...block.style, [key]: value });
  const updateOverride = <K extends keyof AdvancedStyle>(key: K, value: AdvancedStyle[K]) => {
    const existing = block.responsiveStyle[device] ?? {};
    onResponsiveStyleChange({ ...block.responsiveStyle, [device]: { ...existing, [key]: value } });
  };
  const update = isBase ? updateBase : updateOverride;
  const updateMany = (patch: Partial<AdvancedStyle>) => {
    if (isBase) {
      onChange({ ...block.style, ...patch });
      return;
    }
    const existing = block.responsiveStyle[device] ?? {};
    onResponsiveStyleChange({ ...block.responsiveStyle, [device]: { ...existing, ...patch } });
  };
  const clearOverride = () => {
    const rs = { ...block.responsiveStyle };
    delete rs[device];
    onResponsiveStyleChange(rs);
  };
  const updateNested = <K extends keyof AdvancedStyle>(key: K, value: AdvancedStyle[K]) =>
    onChange({ ...block.style, [key]: value });
  const s = active;

  const setImageShadowPreset = (preset: ImageShadowPreset) => {
    if (preset === 'none') {
      onChange({
        ...block.style,
        imageShadowPreset: 'none',
        boxShadow: { ...block.style.boxShadow, enabled: false },
      });
      return;
    }
    if (preset === 'custom') {
      onChange({
        ...block.style,
        imageShadowPreset: 'custom',
        boxShadow: { ...block.style.boxShadow, enabled: true },
      });
      return;
    }
    onChange({
      ...block.style,
      imageShadowPreset: preset,
      boxShadow: { ...IMAGE_SHADOW_PRESETS[preset] },
    });
  };

  return (
    <div className="space-y-0">
      {!isBase && (
        <div className="flex items-center justify-between rounded bg-primary/10 px-2.5 py-1.5 mx-3 mt-2 mb-1">
          <span className="text-[11px] text-primary font-medium">
            {hasOverride ? `${device} overrides active` : `Editing ${device} styles`}
          </span>
          {hasOverride && (
            <button onClick={clearOverride} className="text-[11px] text-primary underline">
              Reset
            </button>
          )}
        </div>
      )}
      <Accordion
        type="multiple"
        defaultValue={[
          'layout',
          'typography',
          'background',
          'border',
          'effects',
          'visibility',
          'custom',
        ]}
        className="w-full"
      >
        {(!tab || tab === 'style') && (
          <>
            <AccordionItem value="layout" className="border-gray-100">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hover:no-underline hover:bg-gray-50">
                Layout
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Align</Label>
                  <div className="flex gap-1">
                    {(
                      [
                        ['left', AlignLeft],
                        ['center', AlignCenter],
                        ['right', AlignRight],
                      ] as const
                    ).map(([a, Icon]) => (
                      <button
                        key={a}
                        onClick={() => update('align', a)}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded border transition-colors',
                          s.align === a
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
                <FourDimInput
                  label="Margin"
                  value={s.margin}
                  onChange={(v) => update('margin', v)}
                  device={device}
                  setDevice={setDevice}
                />
                <FourDimInput
                  label="Padding"
                  value={s.padding}
                  onChange={(v) => update('padding', v)}
                  device={device}
                  setDevice={setDevice}
                />
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Padding preset
                  </Label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => update('paddingY', p)}
                        className={cn(
                          'rounded border py-1 text-[11px] capitalize transition-colors',
                          s.paddingY === p
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {(block.type === 'flex' || block.type === 'container') && (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                        Flex Direction
                      </Label>
                      <div className="flex gap-1">
                        {(
                          [
                            ['row', ArrowRight],
                            ['column', ArrowDown],
                            ['row-reverse', ArrowLeft],
                            ['column-reverse', ArrowUp],
                          ] as const
                        ).map(([d, Icon]) => (
                          <button
                            key={d}
                            onClick={() => update('flexDirection', d)}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded border transition-colors',
                              s.flexDirection === d
                                ? 'border-primary/50 bg-primary/10 text-primary'
                                : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                        Justify Content
                      </Label>
                      <div className="flex gap-1">
                        {(
                          [
                            ['flex-start', AlignLeft],
                            ['center', AlignCenter],
                            ['flex-end', AlignRight],
                            ['space-between', AlignVerticalSpaceBetween],
                            ['space-around', AlignVerticalSpaceAround],
                            ['space-evenly', AlignVerticalJustifyCenter],
                          ] as const
                        ).map(([j, Icon]) => (
                          <button
                            key={j}
                            onClick={() => update('justifyContent', j)}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded border transition-colors',
                              s.justifyContent === j
                                ? 'border-primary/50 bg-primary/10 text-primary'
                                : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                        Align Items
                      </Label>
                      <div className="flex gap-1">
                        {(
                          [
                            ['flex-start', AlignVerticalJustifyStart],
                            ['center', AlignVerticalJustifyCenter],
                            ['flex-end', AlignVerticalJustifyEnd],
                            ['stretch', AlignVerticalSpaceBetween],
                          ] as const
                        ).map(([a, Icon]) => (
                          <button
                            key={a}
                            onClick={() => update('alignItems', a)}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded border transition-colors',
                              s.alignItems === a
                                ? 'border-primary/50 bg-primary/10 text-primary'
                                : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <GapInput
                      label="Gap"
                      value={s.gap || { row: null, column: null, linked: true, unit: 'px' }}
                      onChange={(v) => update('gap', v)}
                      device={device}
                      setDevice={setDevice}
                    />
                  </div>
                )}
                {(isContainerType(block.type) || block.type === 'image') && (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    {isContainerType(block.type) && (
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Container Width
                        </Label>
                        <div className="grid grid-cols-2 gap-1">
                          {(
                            [
                              ['full', 'Full'],
                              ['boxed', 'Boxed'],
                            ] as const
                          ).map(([w, label]) => (
                            <button
                              key={w}
                              onClick={() => updateBase('width', w)}
                              className={cn(
                                'rounded border py-1.5 text-[11px] transition-colors',
                                block.style.width === w
                                  ? 'border-primary/50 bg-primary/10 text-primary'
                                  : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <DimensionInput
                      label="Width"
                      value={s.dimWidth!}
                      onChange={(v) => update('dimWidth', v as any)}
                      units={['px', '%', 'vw', 'auto']}
                      device={device}
                      setDevice={setDevice}
                    />
                    <DimensionInput
                      label="Height"
                      value={s.dimHeight!}
                      onChange={(v) => update('dimHeight', v as any)}
                      units={['px', '%', 'vh', 'auto']}
                      device={device}
                      setDevice={setDevice}
                    />

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="advanced-dimensions" className="border-none">
                        <AccordionTrigger className="py-1 text-[10px] text-gray-500 hover:no-underline">
                          Advanced Dimensions (Min / Max)
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0 space-y-4">
                          <DimensionInput
                            label="Min Width"
                            value={s.minWidth || { value: null, unit: 'auto' }}
                            onChange={(v) => update('minWidth', v as any)}
                            units={['px', '%', 'vw', 'auto']}
                            device={device}
                            setDevice={setDevice}
                          />
                          <DimensionInput
                            label="Max Width"
                            value={s.maxWidth || { value: null, unit: 'auto' }}
                            onChange={(v) => update('maxWidth', v as any)}
                            units={['px', '%', 'vw', 'auto']}
                            device={device}
                            setDevice={setDevice}
                          />
                          <DimensionInput
                            label="Min Height"
                            value={s.minHeight || { value: null, unit: 'auto' }}
                            onChange={(v) => update('minHeight', v as any)}
                            units={['px', '%', 'vh', 'auto']}
                            device={device}
                            setDevice={setDevice}
                          />
                          <DimensionInput
                            label="Max Height"
                            value={s.maxHeight || { value: null, unit: 'auto' }}
                            onChange={(v) => update('maxHeight', v as any)}
                            units={['px', '%', 'vh', 'auto']}
                            device={device}
                            setDevice={setDevice}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
                {block.type === 'image' && (
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                        Object Fit
                      </Label>
                      <select
                        value={s.objectFit || 'cover'}
                        onChange={(e) =>
                          update('objectFit', e.target.value as AdvancedStyle['objectFit'])
                        }
                        className="w-full h-8 text-sm border border-gray-200 rounded px-2"
                      >
                        {IMAGE_OBJECT_FIT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                          Blur
                        </Label>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {s.filterBlur ? `${s.filterBlur}px` : '0px'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={s.filterBlur || '0'}
                        onChange={(e) =>
                          update('filterBlur', e.target.value === '0' ? '' : e.target.value)
                        }
                        className="w-full accent-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                        Shadow
                      </Label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['none', 'soft', 'medium', 'strong', 'custom'] as const).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setImageShadowPreset(preset)}
                            className={cn(
                              'rounded border py-1.5 text-[10px] capitalize transition-colors',
                              (s.imageShadowPreset || 'none') === preset
                                ? 'border-primary/50 bg-primary/10 text-primary'
                                : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                            )}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(s.imageShadowPreset || 'none') === 'custom' && (
                      <BoxShadowPanel
                        shadow={block.style.boxShadow}
                        onChange={(newShadow) => {
                          onChange({
                            ...block.style,
                            imageShadowPreset: 'custom',
                            boxShadow: newShadow,
                          });
                        }}
                      />
                    )}
                  </div>
                )}
                {block.type === 'grid' && (
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                      Columns
                    </Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([1, 2, 3, 4, 5, 6] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            updateMany({
                              columns: c,
                              gridTemplateColumns: `repeat(${c}, 1fr)`,
                            })
                          }
                          className={cn(
                            'rounded border py-1 text-[11px] transition-colors',
                            s.columns === c
                              ? 'border-primary/50 bg-primary/10 text-primary'
                              : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="typography" className="border-gray-100">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hover:no-underline hover:bg-gray-50">
                Typography
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Font Family
                  </Label>
                  <select
                    value={s.fontFamily || ''}
                    onChange={(e) => updateBase('fontFamily', e.target.value)}
                    className="w-full h-7 rounded border border-gray-200 text-[11px] text-gray-700 px-2 focus:border-primary/50 focus:outline-none"
                  >
                    <option value="">Default (System)</option>
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
                    <option value="Mukta">Mukta</option>
                    <option value="Outfit">Outfit</option>
                  </select>
                </div>
                <NumUnitInput
                  label="Font size"
                  value={s.fontSize}
                  unit={s.fontSizeUnit}
                  onValue={(v) => update('fontSize', v)}
                  onUnit={(u) => update('fontSizeUnit', u as AdvancedStyle['fontSizeUnit'])}
                  units={['px', 'em', 'rem', 'vw']}
                  placeholder="inherit"
                  device={device}
                  setDevice={setDevice}
                />
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Font weight
                  </Label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      ['100', 'Thin'],
                      ['400', 'Reg'],
                      ['600', 'Semi'],
                      ['700', 'Bold'],
                      ['800', 'XBold'],
                      ['900', 'Black'],
                    ].map(([w, lbl]) => (
                      <button
                        key={w}
                        onClick={() => update('fontWeight', s.fontWeight === w ? '' : w)}
                        className={cn(
                          'rounded border py-1 text-[10px] transition-colors',
                          s.fontWeight === w
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                        )}
                      >
                        <span style={{ fontWeight: w }}>{lbl}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Line height
                  </Label>
                  <input
                    value={s.lineHeight}
                    onChange={(e) => update('lineHeight', e.target.value)}
                    placeholder="inherit"
                    className="h-7 w-full rounded border border-gray-200 px-2 text-[11px] font-mono text-gray-700 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                <NumUnitInput
                  label="Letter spacing"
                  value={s.letterSpacing}
                  unit={s.letterSpacingUnit}
                  onValue={(v) => update('letterSpacing', v)}
                  onUnit={(u) =>
                    update('letterSpacingUnit', u as AdvancedStyle['letterSpacingUnit'])
                  }
                  units={['px', 'em']}
                  placeholder="0"
                  device={device}
                  setDevice={setDevice}
                />
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Transform
                  </Label>
                  <div className="flex gap-1 flex-wrap">
                    {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => update('textTransform', t)}
                        className={cn(
                          'rounded border px-2 py-0.5 text-[10px] capitalize transition-colors',
                          s.textTransform === t
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                        )}
                      >
                        {t === 'none'
                          ? 'Aa'
                          : t === 'uppercase'
                            ? 'AA'
                            : t === 'lowercase'
                              ? 'aa'
                              : 'Aa+'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Decoration
                  </Label>
                  <div className="flex gap-1">
                    {(['none', 'underline', 'line-through'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => update('textDecoration', d)}
                        className={cn(
                          'rounded border px-2 py-0.5 text-[10px] transition-colors',
                          s.textDecoration === d
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                        )}
                        style={{ textDecoration: d === 'none' ? undefined : d }}
                      >
                        {d === 'none' ? 'None' : d === 'underline' ? 'Under' : 'Strike'}
                      </button>
                    ))}
                  </div>
                </div>
                <ColorPicker
                  label="Color"
                  value={s.textColor}
                  onChange={(v) => update('textColor', v)}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="background" className="border-gray-100">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hover:no-underline hover:bg-gray-50">
                Background
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Preset
                  </Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        ['none', 'None', 'bg-white border border-gray-200'],
                        ['gray', 'Gray', 'bg-gray-100'],
                        ['dark', 'Dark', 'bg-gray-800'],
                      ] as const
                    ).map(([b, label, swatch]) => (
                      <button
                        key={b}
                        onClick={() => {
                          update('bg', b);
                          update('backgroundColor', '');
                        }}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded border py-2 text-[11px] transition-colors',
                          s.bg === b && !s.backgroundColor
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-gray-200 hover:bg-gray-50',
                        )}
                      >
                        <div className={cn('h-3 w-6 rounded', swatch)} />
                        <span className="text-gray-500">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <ColorPicker
                  label="Custom color"
                  value={s.backgroundColor}
                  onChange={(v) => update('backgroundColor', v)}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="border" className="border-gray-100">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hover:no-underline hover:bg-gray-50">
                Border
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Style</Label>
                  <div className="flex gap-1 flex-wrap">
                    {(['none', 'solid', 'dashed', 'dotted', 'double'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => update('borderStyle', st)}
                        className={cn(
                          'rounded border px-2 py-0.5 text-[10px] capitalize transition-colors',
                          s.borderStyle === st
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50',
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
                {s.borderStyle !== 'none' && (
                  <>
                    <FourDimInput
                      label="Width"
                      value={block.style.borderWidth}
                      onChange={(v) => updateNested('borderWidth', v)}
                      units={['px', 'em']}
                    />
                    <ColorPicker
                      label="Color"
                      value={s.borderColor}
                      onChange={(v) => update('borderColor', v)}
                    />
                  </>
                )}
                <BorderRadiusInput
                  value={block.style.borderRadius}
                  onChange={(v) => updateNested('borderRadius', v)}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="effects" className="border-gray-100">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hover:no-underline hover:bg-gray-50">
                Effects
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
                      Opacity
                    </Label>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {s.opacity !== '' ? s.opacity + '%' : '100%'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={s.opacity !== '' ? s.opacity : '100'}
                    onChange={(e) =>
                      update('opacity', e.target.value === '100' ? '' : e.target.value)
                    }
                    className="w-full accent-primary"
                  />
                </div>
                <BoxShadowPanel
                  shadow={block.style.boxShadow}
                  onChange={(newShadow) => updateNested('boxShadow', newShadow)}
                />
              </AccordionContent>
            </AccordionItem>
          </>
        )}

        {(!tab || tab === 'advanced') && (
          <>
            <AccordionItem value="visibility" className="border-gray-100">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hover:no-underline hover:bg-gray-50">
                Visibility
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="flex gap-1.5">
                  {DEVICES.map((d) => {
                    const DevIcon =
                      d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
                    const visible = block.visibility[d];
                    return (
                      <Tooltip key={d}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              onVisibilityChange({ ...block.visibility, [d]: !visible })
                            }
                            className={cn(
                              'flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] transition-colors',
                              visible
                                ? 'border-gray-200 bg-white text-gray-600'
                                : 'border-dashed border-gray-200 bg-gray-50 text-gray-300 line-through',
                            )}
                          >
                            <DevIcon className="h-3.5 w-3.5" />
                            <span className="capitalize">{d}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {d}: {visible ? 'visible' : 'hidden'}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="custom" className="border-0">
              <AccordionTrigger className="px-3 py-2 text-[11px] font-semibold text-gray-600 uppercase tracking-wider hover:no-underline hover:bg-gray-50">
                Custom CSS
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-2">
                <div className="rounded bg-gray-900 px-2.5 py-1 text-[10px] font-mono text-gray-400">
                  <span className="text-primary/80">.b-{block.id}</span>
                  <span className="text-gray-500"> {'{'}</span>
                </div>
                <Textarea
                  value={block.style.customCSS}
                  onChange={(e) => updateNested('customCSS', e.target.value)}
                  placeholder={`color: red;\nmargin-top: 20px;\n/* declarations only — or use .element { ... } */`}
                  rows={6}
                  className="text-[11px] font-mono resize-y bg-gray-900 text-green-400 border-gray-700 placeholder:text-gray-600 focus:border-primary/60"
                  spellCheck={false}
                />
                <div className="rounded bg-gray-900 px-2.5 py-1 text-[10px] font-mono text-gray-500">
                  {'}'}
                </div>
                <p className="mt-2 text-[10px] text-gray-500">
                  Enter CSS declarations only, or a full rule using{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">.element</code> as a shortcut
                  for <code className="bg-gray-100 px-1 py-0.5 rounded">.b-{block.id}</code>.
                </p>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>
    </div>
  );
}
