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

function mockVideoBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-video-id',
    type: 'video',
    props: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
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

test('video block is fully registered', () => {
  const def = getBlockDefinition('video');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockVideoBlock(), mockCtx())).not.toThrow();
});

test('video exports stable HTML', () => {
  const def = getBlockDefinition('video');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockVideoBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-video-id"/);
  expect(html).toMatch(/<iframe/);
});

test('video propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('video');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ url: 123 })).toThrow();
});
