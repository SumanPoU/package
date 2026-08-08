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

function mockButtonBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-button-id',
    type: 'button',
    props: { text: 'Click me' },
    i18nProps: {
      text: { [LOCALES.EN]: 'Click me' },
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

test('button block is fully registered', () => {
  const def = getBlockDefinition('button');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(def!.sharedProps).toEqual(['href', 'target']);
  expect(() => def!.renderToHtml(mockButtonBlock(), mockCtx())).not.toThrow();
});

test('button without href exports a button element', () => {
  const def = getBlockDefinition('button');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockButtonBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-button-id"/);
  expect(html).toMatch(/<button\b/);
  expect(html).toMatch(/Click me/);
  expect(html).not.toMatch(/<a\b/);
});

test('button with href and _blank target exports an anchor with rel', () => {
  const def = getBlockDefinition('button');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockButtonBlock({
      props: { href: 'https://example.com', target: '_blank' },
      i18nProps: {
        text: { [LOCALES.EN]: 'Go', [LOCALES.NP]: 'जानुहोस्' },
      },
    }),
    mockCtx(LOCALES.NP),
  );
  expect(html).toMatch(/<a\b/);
  expect(html).toMatch(/href="https:\/\/example.com"/);
  expect(html).toMatch(/target="_blank"/);
  expect(html).toMatch(/rel="noopener noreferrer"/);
  expect(html).toMatch(/जानुहोस्/);
  expect(html).not.toMatch(/<button\b/);
});

test('button with href but non-blank target omits target/rel', () => {
  const def = getBlockDefinition('button');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockButtonBlock({
      props: { href: 'https://example.com', target: '_self' },
    }),
    mockCtx(),
  );
  expect(html).toMatch(/<a\b/);
  expect(html).toMatch(/href="https:\/\/example.com"/);
  expect(html).not.toMatch(/target="/);
  expect(html).not.toMatch(/rel="/);
});

test('button propsSchema parses defaultProps and rejects invalid target/href', () => {
  const def = getBlockDefinition('button');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ target: '_top' })).toThrow();
  expect(() => def!.propsSchema!.parse({ href: 123 })).toThrow();
  expect(() => def!.propsSchema!.parse({ text: 123 })).toThrow();
});
