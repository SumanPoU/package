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

function mockBadgeBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-badge-id',
    type: 'badge',
    props: { text: 'New' },
    i18nProps: { text: { [LOCALES.EN]: 'New' } },
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

test('badge block is fully registered', () => {
  const def = getBlockDefinition('badge');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockBadgeBlock(), mockCtx())).not.toThrow();
});

test('badge exports stable HTML for default text', () => {
  const def = getBlockDefinition('badge');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockBadgeBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-badge-id"/);
  expect(html).toMatch(/>New</);
});

test('badge export uses resolved i18n text', () => {
  const def = getBlockDefinition('badge');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockBadgeBlock({ i18nProps: { text: { [LOCALES.EN]: 'Featured' } } }),
    mockCtx(),
  );
  expect(html).toMatch(/>Featured</);
});

test('badge propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('badge');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ text: 123 })).toThrow();
});
