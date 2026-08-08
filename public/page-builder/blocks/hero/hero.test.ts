import { LOCALES } from '@/config/languages';
import { expect, test } from 'vitest';

import {
  DEFAULT_STYLE,
  DEFAULT_VISIBILITY,
  makeDefaultBorderRadius,
  makeDefaultBoxShadow,
  makeDefaultSpacing,
} from '../../constants';
import { getBlockDefinition } from '../../core/registry';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

import './index';

function mockHeroBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-hero-id',
    type: 'hero',
    props: {
      backgroundImage: '',
      backgroundColor: '#0f172a',
      ctaUrl: '#',
      ctaTarget: '_self',
      alignment: 'center',
      overlayOpacity: '0.45',
    },
    i18nProps: {
      heading: { [LOCALES.EN]: 'Build something great' },
      subheading: { [LOCALES.EN]: 'A short supporting line for your landing page.' },
      ctaLabel: { [LOCALES.EN]: 'Get started' },
    },
    style: {
      ...DEFAULT_STYLE,
      margin: makeDefaultSpacing(),
      padding: makeDefaultSpacing(),
      borderWidth: makeDefaultSpacing(),
      borderRadius: makeDefaultBorderRadius(),
      boxShadow: makeDefaultBoxShadow(),
    },
    visibility: { ...DEFAULT_VISIBILITY },
    responsiveStyle: {},
    ...overrides,
  };
}

function mockCtx(lang: string = LOCALES.EN): ExportContext {
  return { lang };
}

test('hero block is fully registered', () => {
  const def = getBlockDefinition('hero');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(def!.propsSchema).toBeDefined();
  expect(() => def!.renderToHtml(mockHeroBlock(), mockCtx())).not.toThrow();
});

test('hero propsSchema parses defaultProps and rejects invalid enums', () => {
  const def = getBlockDefinition('hero');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({ alignment: 'justify' })).toThrow();
  expect(() => def!.propsSchema!.parse({ ctaTarget: '_top' })).toThrow();
});
