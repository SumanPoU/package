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

function mockIconBoxBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-icon-box-id',
    type: 'icon_box',
    props: { iconName: 'Star', title: 'Icon Box', description: 'Description goes here' },
    i18nProps: {
      title: { [LOCALES.EN]: 'Icon Box' },
      description: { [LOCALES.EN]: 'Description goes here' },
    },
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

function mockCtx(lang: string = LOCALES.EN): ExportContext {
  return { lang };
}

test('icon_box block is fully registered', () => {
  const def = getBlockDefinition('icon_box');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockIconBoxBlock(), mockCtx())).not.toThrow();
});

test('icon_box exports stable HTML for default props', () => {
  const def = getBlockDefinition('icon_box');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockIconBoxBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-icon-box-id"/);
  expect(html).toMatch(/<svg/);
  expect(html).toMatch(/Icon Box/);
  expect(html).toMatch(/Description goes here/);
});

test('icon_box export respects custom iconName and i18n props', () => {
  const def = getBlockDefinition('icon_box');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockIconBoxBlock({
      props: { iconName: 'Heart' },
      i18nProps: {
        title: { [LOCALES.EN]: 'EN Title', [LOCALES.NP]: 'NE Title' },
        description: { [LOCALES.EN]: 'EN Desc', [LOCALES.NP]: 'NE Desc' },
      },
    }),
    mockCtx(LOCALES.NP),
  );
  expect(html).toMatch(/<svg/);
  expect(html).toMatch(/NE Title/);
  expect(html).toMatch(/NE Desc/);
});

test('icon_box propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('icon_box');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ iconName: 123 })).toThrow();
});
