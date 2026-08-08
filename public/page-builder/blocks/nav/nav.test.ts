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

import { parseNavLinks } from './parseNavLinks';

import './index';

function mockNavBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-nav-id',
    type: 'nav',
    props: {},
    i18nProps: {
      links: {
        [LOCALES.EN]: 'Home,/\nAbout,/about\nContact,/contact',
      },
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

test('parseNavLinks parses multiple links and trims whitespace', () => {
  expect(parseNavLinks('Home,/\nAbout, /about')).toEqual([
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about' },
  ]);
});

test('parseNavLinks handles empty lines and malformed lines', () => {
  // - empty lines are removed by filter(Boolean)
  // - missing comma => url is undefined
  // - extra commas => values after the 2nd comma are ignored
  // - whitespace-only line => label becomes "" (after trim), url becomes undefined
  expect(parseNavLinks('Home,/\n\nOnlyLabel\n,/foo\nA,B,C\n ')).toEqual([
    { label: 'Home', url: '/' },
    { label: 'OnlyLabel', url: undefined },
    { label: '', url: '/foo' },
    { label: 'A', url: 'B' },
    { label: '', url: undefined },
  ]);
});

test('nav block is fully registered', () => {
  const def = getBlockDefinition('nav');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockNavBlock(), mockCtx())).not.toThrow();
});

test('nav exports stable HTML', () => {
  const def = getBlockDefinition('nav');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockNavBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-nav-id"/);
  expect(html).toMatch(/href="\/"/);
  expect(html).toMatch(/Home/);
  expect(html).toMatch(/About/);
  expect(html).toMatch(/Contact/);
});

test('nav propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('nav');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ links: 123 })).toThrow();
});
