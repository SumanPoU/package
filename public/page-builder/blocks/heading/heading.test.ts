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

function mockHeadingBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-heading-id',
    type: 'heading',
    props: { text: 'New heading', level: '2' },
    i18nProps: {
      text: { [LOCALES.EN]: 'New heading' },
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

test('heading block is fully registered', () => {
  const def = getBlockDefinition('heading');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockHeadingBlock(), mockCtx())).not.toThrow();
});

test('heading exports stable HTML for default level 2', () => {
  const def = getBlockDefinition('heading');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockHeadingBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-heading-id"/);
  expect(html).toMatch(/<h2\b/);
  expect(html).toMatch(/New heading/);
  expect(html).toMatch(/<\/h2>/);
});

test('heading export respects level and i18n text', () => {
  const def = getBlockDefinition('heading');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockHeadingBlock({
      props: { level: '1' },
      i18nProps: {
        text: { [LOCALES.EN]: 'EN Title', [LOCALES.NP]: 'NE Title' },
      },
    }),
    mockCtx(LOCALES.NP),
  );
  expect(html).toMatch(/<h1\b/);
  expect(html).toMatch(/NE Title/);
  expect(html).not.toMatch(/EN Title/);
  expect(html).toMatch(/<\/h1>/);
});

test('heading propsSchema parses defaultProps and rejects invalid level', () => {
  const def = getBlockDefinition('heading');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ level: '7' })).toThrow();
  expect(() => def!.propsSchema!.parse({ text: 123 })).toThrow();
});
