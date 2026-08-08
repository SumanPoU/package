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

function mockSpacerBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-spacer-id',
    type: 'spacer',
    props: { height: '50' },
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

test('spacer block is fully registered', () => {
  const def = getBlockDefinition('spacer');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockSpacerBlock(), mockCtx())).not.toThrow();
});

test('spacer exports stable HTML for default height', () => {
  const def = getBlockDefinition('spacer');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockSpacerBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-spacer-id"/);
  expect(html).toMatch(/height:50px/);
});

test('spacer exports custom height from props', () => {
  const def = getBlockDefinition('spacer');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockSpacerBlock({ props: { height: '120' } }), mockCtx());
  expect(html).toMatch(/height:120px/);
});

test('spacer propsSchema parses defaultProps and rejects invalid height', () => {
  const def = getBlockDefinition('spacer');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ height: 123 })).toThrow();
});
