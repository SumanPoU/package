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
import { collectCss } from '../../lib/html-export/collectCss';
import { renderBlockToHtml } from '../../lib/html-export/renderBlock';

import './index';

function mockGridBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-grid-id',
    type: 'grid',
    props: {},
    i18nProps: {},
    style: {
      ...DEFAULT_STYLE,
      columns: 2,
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

test('grid block is fully registered as isContainer', () => {
  const def = getBlockDefinition('grid');
  expect(def).toBeDefined();
  expect(def!.isContainer).toBe(true);
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(def!.defaultStyle).toMatchObject({
    columns: 2,
    width: 'full',
    height: 'auto',
    customHeight: '400',
  });
  expect(() =>
    def!.renderToHtml(mockGridBlock(), { lang: LOCALES.EN } as ExportContext),
  ).not.toThrow();
});

test('grid propsSchema parses empty props and rejects non-object', () => {
  const def = getBlockDefinition('grid');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse(123)).toThrow();
  expect(() => def!.propsSchema!.parse([])).toThrow();
});

test('grid export emits responsive column media queries', () => {
  const block = mockGridBlock({
    style: {
      ...mockGridBlock().style,
      columns: 3,
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    responsiveStyle: {
      tablet: { columns: 2, gridTemplateColumns: 'repeat(2, 1fr)' },
      mobile: { columns: 1, gridTemplateColumns: 'repeat(1, 1fr)' },
    },
  });

  const css = collectCss([block]).join('\n');
  expect(css).toMatch(/\.b-test-grid-id-layout\{grid-template-columns:repeat\(3, 1fr\)\}/);
  expect(css).toMatch(
    /@media\(min-width:640px\) and \(max-width:1023px\)\{\.b-test-grid-id-layout\{grid-template-columns:repeat\(2, 1fr\)\}\}/,
  );
  expect(css).toMatch(
    /@media\(max-width:639px\)\{\.b-test-grid-id-layout\{grid-template-columns:repeat\(1, 1fr\)\}\}/,
  );

  const html = renderBlockToHtml({ block, lang: LOCALES.EN });
  expect(html).toMatch(/class="b-test-grid-id-layout"/);
  expect(html).not.toMatch(/grid-template-columns/);
});
