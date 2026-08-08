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

function mockImageBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-image-id',
    type: 'image',
    props: { src: 'https://placehold.co/800x400', alt: 'Placeholder' },
    i18nProps: {
      alt: { [LOCALES.EN]: 'Placeholder' },
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

function mockCtx(): ExportContext {
  return { lang: LOCALES.EN };
}

test('image block is fully registered', () => {
  const def = getBlockDefinition('image');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockImageBlock(), mockCtx())).not.toThrow();
});

test('image exports stable HTML', () => {
  const def = getBlockDefinition('image');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockImageBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-image-id"/);
  expect(html).toMatch(/<img/);
  expect(html).toMatch(/placehold\.co\/800x400/);
  expect(html).toMatch(/alt="Placeholder"/);
});

test('image propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('image');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ src: 123 })).toThrow();
});
