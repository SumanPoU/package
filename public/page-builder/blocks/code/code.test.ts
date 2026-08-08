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

function mockCodeBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-code-id',
    type: 'code',
    props: { code: 'console.log("Hello world");', language: 'javascript' },
    i18nProps: {
      code: { [LOCALES.EN]: 'console.log("Hello world");' },
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

test('code block is fully registered', () => {
  const def = getBlockDefinition('code');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(() => def!.renderToHtml(mockCodeBlock(), mockCtx())).not.toThrow();
});

test('code export escapes markup and keeps pre/code wrapper', () => {
  const def = getBlockDefinition('code');
  expect(def).toBeDefined();
  const payload = '<script>alert(1)</script>';
  const html = def!.renderToHtml(
    mockCodeBlock({
      props: { code: payload, language: 'html' },
      i18nProps: { code: { [LOCALES.EN]: payload } },
    }),
    mockCtx(),
  );
  expect(html).toMatch(/class="b-test-code-id"/);
  expect(html).toMatch(/<pre\b/);
  expect(html).toMatch(/<code\b/);
  expect(html).toMatch(/data-language="html"/);
  expect(html).toMatch(/width:100%/);
  expect(html).toMatch(/overflow-x:auto/);
  expect(html).toMatch(/&lt;script&gt;/);
  expect(html).not.toMatch(/<script>/i);
});

test('code propsSchema parses defaultProps and rejects invalid shape', () => {
  const def = getBlockDefinition('code');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({})).not.toThrow();
  expect(() => def!.propsSchema!.parse({ code: 123 })).toThrow();
});
