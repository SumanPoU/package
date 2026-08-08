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

function mockContainerBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-container-id',
    type: 'container',
    props: {},
    i18nProps: {},
    style: {
      ...DEFAULT_STYLE,
      width: 'boxed',
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

test('container block is fully registered as isContainer', () => {
  const def = getBlockDefinition('container');
  expect(def).toBeDefined();
  expect(def!.isContainer).toBe(true);
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(def!.defaultStyle).toMatchObject({
    width: 'boxed',
    height: 'auto',
    customHeight: '400',
  });
  expect(() =>
    def!.renderToHtml(mockContainerBlock(), { lang: LOCALES.EN } as ExportContext),
  ).not.toThrow();
});

test('container propsSchema parses empty props and rejects non-object', () => {
  const def = getBlockDefinition('container');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse(123)).toThrow();
  expect(() => def!.propsSchema!.parse([])).toThrow();
});
