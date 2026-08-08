import { LOCALES } from '@/config/languages';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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

import { TextElement } from './TextElement';
import './index';

function mockTextBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-text-id',
    type: 'text',
    props: { text: 'Some descriptive text goes here.' },
    i18nProps: {
      text: { [LOCALES.EN]: 'Some descriptive text goes here.' },
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

const XSS_PAYLOAD =
  '<div onclick="alert(1)">x</div><script>alert(2)</script><img src=x onerror=alert(3)>';

test('text block is fully registered', () => {
  const def = getBlockDefinition('text');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockTextBlock(), mockCtx())).not.toThrow();
});

test('text exports stable HTML', () => {
  const def = getBlockDefinition('text');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(mockTextBlock(), mockCtx());
  expect(html).toMatch(/class="b-test-text-id"/);
  expect(html).toMatch(/Some descriptive text goes here\./);
});

test('text export strips script and event-handler XSS payloads', () => {
  const def = getBlockDefinition('text');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockTextBlock({
      props: { text: XSS_PAYLOAD },
      i18nProps: { text: { [LOCALES.EN]: XSS_PAYLOAD } },
    }),
    mockCtx(),
  );
  expect(html).not.toMatch(/<script/i);
  expect(html).not.toMatch(/onclick/i);
  expect(html).not.toMatch(/onerror/i);
  expect(html).toMatch(/>x</);
});

test('text canvas strips script and event-handler XSS payloads', () => {
  const markup = renderToStaticMarkup(
    createElement(TextElement, {
      block: mockTextBlock({
        props: { text: XSS_PAYLOAD },
        i18nProps: { text: { [LOCALES.EN]: XSS_PAYLOAD } },
      }),
      lang: LOCALES.EN,
    }),
  );
  expect(markup).not.toMatch(/<script/i);
  expect(markup).not.toMatch(/onclick/i);
  expect(markup).not.toMatch(/onerror/i);
  expect(markup).toMatch(/>x</);
});

test('sanitizeBlockHtml removes javascript: URLs from anchors', () => {
  const clean = sanitizeBlockHtml('<a href="javascript:alert(1)">click</a>');
  expect(clean).not.toMatch(/javascript:/i);
});

test('text propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('text');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ text: 123 })).toThrow();
});
