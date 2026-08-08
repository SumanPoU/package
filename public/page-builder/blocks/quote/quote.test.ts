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

function mockQuoteBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-quote-id',
    type: 'quote',
    props: {},
    i18nProps: { text: { [LOCALES.EN]: 'Hello' }, author: { [LOCALES.EN]: 'Author' } },
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

test('quote block is fully registered', () => {
  const def = getBlockDefinition('quote');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockQuoteBlock(), mockCtx())).not.toThrow();
});

test('quote exports stable HTML', () => {
  const def = getBlockDefinition('quote');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockQuoteBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-quote-id"/);
  expect(html).toMatch(/blockquote/);
});

test('quote propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('quote');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ text: 123 })).toThrow();
  expect(() => def!.propsSchema!.parse({ author: 123 })).toThrow();
});
