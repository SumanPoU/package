import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import type { z } from 'zod';

import type { AdvancedStyle, Block, ComponentType, Device, I18nProps } from '../types';

export type { AdvancedStyle, Block, ComponentType, Device, I18nProps };

export type BlockDefinitionCategory = 'layout' | 'basic' | 'marketing' | 'embeds';

export type OnChangeShared = (key: string, value: string) => void;

export type OnChangeI18n = (i18nProps: I18nProps) => void;

export type ExportContext = {
  lang: string;
};

export type BlockDefinition<P = Record<string, unknown>> = {
  type: ComponentType;
  label: string;
  icon: LucideIcon;
  category: BlockDefinitionCategory;
  isContainer?: boolean;

  defaultProps: P;
  defaultStyle?: Partial<AdvancedStyle>;
  translatableProps: (keyof P & string)[];
  sharedProps: (keyof P & string)[];

  CanvasComponent: React.FC<{ block: Block; lang: string }>;
  ContentFields: React.FC<{
    block: Block;
    activeLang: string;
    onChangeShared: OnChangeShared;
    onChangeI18n: OnChangeI18n;
  }>;
  StyleFields?: React.FC<{ block: Block; device: Device }>;
  renderToHtml: (block: Block, ctx: ExportContext) => string;

  propsSchema?: z.ZodType<P>;
};
