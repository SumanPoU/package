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

function mockCounterBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-counter-id',
    type: 'counter',
    props: { targetNumber: '100' },
    i18nProps: { label: { [LOCALES.EN]: 'Counter' } },
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

test('counter block is fully registered', () => {
  const def = getBlockDefinition('counter');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockCounterBlock(), mockCtx())).not.toThrow();
});

test('counter exports stable HTML for default props', () => {
  const def = getBlockDefinition('counter');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockCounterBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-counter-id"/);
  expect(html).toMatch(/100/);
});

test('counter propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('counter');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ targetNumber: 123 })).toThrow();
});
