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
import { sanitizeBlockHtml } from '../../lib/sanitizeHtml';

import './index';

function mockHtmlBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-html-id',
    type: 'html',
    props: { code: '<div>Custom HTML goes here</div>' },
    i18nProps: {
      code: { [LOCALES.EN]: '<div>Custom HTML goes here</div>' },
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

function mockCtx(): ExportContext {
  return { lang: LOCALES.EN };
}

test('html block is fully registered', () => {
  const def = getBlockDefinition('html');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockHtmlBlock(), mockCtx())).not.toThrow();
});

test('html export sanitizes code and keeps safe markup', () => {
  const def = getBlockDefinition('html');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockHtmlBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-html-id"/);
  expect(html).toMatch(/<div>Custom HTML goes here<\/div>/);
});

test('html export strips script and event-handler XSS payloads', () => {
  const def = getBlockDefinition('html');
  expect(def).toBeDefined();
  const payload =
    '<div onclick="alert(1)">x</div><script>alert(2)</script><img src=x onerror=alert(3)>';
  const html = def!.renderToHtml(
    mockHtmlBlock({
      props: { code: payload },
      i18nProps: { code: { [LOCALES.EN]: payload } },
    }),
    mockCtx(),
  );
  expect(html).not.toMatch(/<script/i);
  expect(html).not.toMatch(/onclick/i);
  expect(html).not.toMatch(/onerror/i);
  expect(html).toMatch(/>x</);
});

test('html sanitize keeps section landmarks for canvas/export', () => {
  const markup = '<section><h2>About This Page</h2><p>This is a sample paragraph.</p></section>';
  const clean = sanitizeBlockHtml(markup);
  expect(clean).toMatch(/<section>/);
  expect(clean).toMatch(/<h2>About This Page<\/h2>/);
  expect(clean).toMatch(/<p>This is a sample paragraph\.<\/p>/);
});

test('sanitizeBlockHtml removes javascript: URLs from anchors', () => {
  const clean = sanitizeBlockHtml('<a href="javascript:alert(1)">click</a>');
  expect(clean).not.toMatch(/javascript:/i);
});

test('html propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('html');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ code: 123 })).toThrow();
});
