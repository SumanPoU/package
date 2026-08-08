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

function mockIconBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-icon-id',
    type: 'icon',
    props: { iconName: 'Smile' },
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

test('icon block is fully registered', () => {
  const def = getBlockDefinition('icon');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockIconBlock(), mockCtx())).not.toThrow();
});

test('icon exports stable HTML for default props', () => {
  const def = getBlockDefinition('icon');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockIconBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-icon-id"/);
  expect(html).toMatch(/<svg/);
});

test('icon export respects custom iconName prop', () => {
  const def = getBlockDefinition('icon');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockIconBlock({ props: { iconName: 'Star' } }), mockCtx());
  expect(html).toMatch(/<svg/);
});

test('icon propsSchema parses defaultProps and rejects invalid iconName', () => {
  const def = getBlockDefinition('icon');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ iconName: 123 })).toThrow();
});
