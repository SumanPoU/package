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

function mockAlertBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-alert-id',
    type: 'alert',
    props: { variant: 'info' },
    i18nProps: { title: { [LOCALES.EN]: 'Info' }, text: { [LOCALES.EN]: 'Message' } },
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

test('alert block is fully registered', () => {
  const def = getBlockDefinition('alert');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockAlertBlock(), mockCtx())).not.toThrow();
});

test('alert exports stable HTML', () => {
  const def = getBlockDefinition('alert');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockAlertBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-alert-id"/);
  expect(html).toMatch(/role="alert"/);
});

test('alert propsSchema parses defaultProps and rejects invalid variant/fields', () => {
  const def = getBlockDefinition('alert');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ variant: 'critical' })).toThrow();
  expect(() => def!.propsSchema!.parse({ title: 123 })).toThrow();
  expect(() => def!.propsSchema!.parse({ text: 123 })).toThrow();
});
