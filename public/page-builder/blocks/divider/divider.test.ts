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

function mockDividerBlock(): Block {
  return {
    id: 'test-divider-id',
    type: 'divider',
    props: {},
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
  };
}

function mockCtx(): ExportContext {
  return { lang: LOCALES.EN };
}

test('divider block is fully registered', () => {
  const def = getBlockDefinition('divider');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockDividerBlock(), mockCtx())).not.toThrow();
});

test('divider exports stable HTML for default props', () => {
  const def = getBlockDefinition('divider');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockDividerBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-divider-id"/);
  expect(html).toMatch(/<hr/);
});

test('divider propsSchema parses empty props and rejects non-object', () => {
  const def = getBlockDefinition('divider');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse(123)).toThrow();
});
