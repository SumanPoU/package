import { AdvancedStyle, Block, DimensionValue, ResponsiveOverrides, Device } from '../types';

function migrateDimension(style: Partial<AdvancedStyle>): void {
  if (style.width !== undefined && style.dimWidth === undefined) {
    if (style.width === 'full') {
      style.dimWidth = { value: 100, unit: '%' };
    } else if (style.width === 'boxed') {
      style.dimWidth = { value: 1200, unit: 'px' };
    }
  }

  if (style.height !== undefined && style.dimHeight === undefined) {
    if (style.height === 'auto') {
      style.dimHeight = { value: null, unit: 'auto' };
    } else if (style.height === 'full') {
      style.dimHeight = { value: 100, unit: '%' };
    } else if (style.height === 'custom' && style.customHeight) {
      style.dimHeight = { value: Number(style.customHeight) || 400, unit: 'px' };
    }
  }
}

export function migrateBlockStyle(block: Block): Block {
  const migratedBlock = { ...block };

  if (migratedBlock.style) {
    const newStyle = { ...migratedBlock.style };
    migrateDimension(newStyle);
    migratedBlock.style = newStyle as AdvancedStyle;
  }

  if (migratedBlock.responsiveStyle) {
    const newResponsive = { ...migratedBlock.responsiveStyle };
    for (const device of ['desktop', 'tablet', 'mobile'] as Device[]) {
      if (newResponsive[device]) {
        const deviceStyle = { ...newResponsive[device] };
        migrateDimension(deviceStyle);
        newResponsive[device] = deviceStyle;
      }
    }
    migratedBlock.responsiveStyle = newResponsive;
  }

  if (migratedBlock.children && migratedBlock.children.length > 0) {
    migratedBlock.children = migratedBlock.children.map(migrateBlockStyle);
  }

  return migratedBlock;
}
