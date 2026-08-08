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

function mockProgressBarBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-progress-bar-id',
    type: 'progress_bar',
    props: { percentage: '75' },
    i18nProps: { label: { [LOCALES.EN]: 'Completion' } },
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

test('progress_bar block is fully registered', () => {
  const def = getBlockDefinition('progress_bar');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockProgressBarBlock(), mockCtx())).not.toThrow();
});

test('progress_bar exports stable HTML for default props', () => {
  const def = getBlockDefinition('progress_bar');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockProgressBarBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-progress-bar-id"/);
  expect(html).toMatch(/75%/);
});

test('progress_bar propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('progress_bar');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ percentage: 123 })).toThrow();
});
