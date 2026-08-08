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

function mockStarRatingBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-star-rating-id',
    type: 'star_rating',
    props: { rating: '4', maxRating: '5' },
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

test('star_rating block is fully registered', () => {
  const def = getBlockDefinition('star_rating');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockStarRatingBlock(), mockCtx())).not.toThrow();
});

test('star_rating exports stable HTML for default props', () => {
  const def = getBlockDefinition('star_rating');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockStarRatingBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-star-rating-id"/);
  expect(html).toMatch(/<svg/);
});

test('star_rating propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('star_rating');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ rating: 123 })).toThrow();
  expect(() => def!.propsSchema!.parse({ maxRating: 123 })).toThrow();
});
