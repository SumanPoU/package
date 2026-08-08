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

function mockListBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-list-id',
    type: 'list',
    props: { items: 'First item\nSecond item\nThird item', listType: 'unordered' },
    i18nProps: {
      items: { [LOCALES.EN]: 'First item\nSecond item\nThird item' },
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

test('list block is fully registered', () => {
  const def = getBlockDefinition('list');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockListBlock(), mockCtx())).not.toThrow();
});

test('list exports stable HTML for default unordered props', () => {
  const def = getBlockDefinition('list');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockListBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-list-id"/);
  expect(html).toMatch(/<ul\b/);
  expect(html).toMatch(/list-style-type:disc/);
  expect(html).toMatch(/First item/);
  expect(html).toMatch(/Second item/);
  expect(html).toMatch(/Third item/);
});

test('list export respects listType and i18n items', () => {
  const def = getBlockDefinition('list');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockListBlock({
      props: { listType: 'ordered' },
      i18nProps: {
        items: { [LOCALES.EN]: 'A\nB', [LOCALES.NP]: 'क\nख' },
      },
    }),
    mockCtx(LOCALES.NP),
  );
  expect(html).toMatch(/<ol\b/);
  expect(html).toMatch(/list-style-type:decimal/);
  expect(html).toMatch(/क/);
  expect(html).toMatch(/ख/);
  expect(html).not.toMatch(/>A</);
});

test('list propsSchema parses defaultProps and rejects invalid listType', () => {
  const def = getBlockDefinition('list');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ listType: 'diamond' })).toThrow();
});
