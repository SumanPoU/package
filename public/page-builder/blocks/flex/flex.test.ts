import { LOCALES } from '@/config/languages';
import { expect, test } from 'vitest';

import { getBlockDefinition } from '../../core/registry';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';
import {
  DEFAULT_STYLE,
  DEFAULT_VISIBILITY,
  makeDefaultBorderRadius,
  makeDefaultBoxShadow,
  makeDefaultSpacing,
} from '../../constants';

import './index';

function mockFlexBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-flex-id',
    type: 'flex',
    props: {},
    i18nProps: {},
    style: {
      ...DEFAULT_STYLE,
      width: 'full',
      height: 'auto',
      customHeight: '400',
      margin: makeDefaultSpacing(),
      padding: makeDefaultSpacing(),
      borderWidth: makeDefaultSpacing(),
      borderRadius: makeDefaultBorderRadius(),
      boxShadow: makeDefaultBoxShadow(),
    },
    visibility: { ...DEFAULT_VISIBILITY },
    responsiveStyle: {},
    children: [],
    ...overrides,
  };
}

test('flex block is fully registered as isContainer', () => {
  const def = getBlockDefinition('flex');
  expect(def).toBeDefined();
  expect(def!.isContainer).toBe(true);
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(def!.defaultStyle).toMatchObject({
    width: 'full',
    height: 'auto',
    customHeight: '400',
  });
  expect(() =>
    def!.renderToHtml(mockFlexBlock(), { lang: LOCALES.EN } as ExportContext),
  ).not.toThrow();
});

test('flex propsSchema parses empty props and rejects non-object', () => {
  const def = getBlockDefinition('flex');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse(123)).toThrow();
  expect(() => def!.propsSchema!.parse([])).toThrow();
});
