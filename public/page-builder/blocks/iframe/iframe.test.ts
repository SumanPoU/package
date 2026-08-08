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

function mockIframeBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-iframe-id',
    type: 'iframe',
    props: { url: 'https://example.com' },
    i18nProps: {},
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

test('iframe block is fully registered', () => {
  const def = getBlockDefinition('iframe');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockIframeBlock(), mockCtx())).not.toThrow();
});

test('iframe exports stable HTML', () => {
  const def = getBlockDefinition('iframe');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockIframeBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-iframe-id"/);
  expect(html).toMatch(/<iframe/);
  expect(html).toMatch(/https:\/\/example\.com/);
});

test('iframe propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('iframe');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ url: 123 })).toThrow();
});
