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

function mockMapBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-map-id',
    type: 'map',
    props: {},
    i18nProps: { address: { [LOCALES.EN]: 'New York, NY' } },
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

test('map block is fully registered', () => {
  const def = getBlockDefinition('map');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockMapBlock(), mockCtx())).not.toThrow();
});

test('map exports stable HTML', () => {
  const def = getBlockDefinition('map');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockMapBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-map-id"/);
  expect(html).toMatch(/google\.com\/maps/);
  expect(html).toMatch(/<iframe/);
});

test('map propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('map');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ address: 123 })).toThrow();
});
