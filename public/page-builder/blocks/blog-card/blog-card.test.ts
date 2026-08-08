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

function mockBlogCardBlock(overrides?: Partial<Block>): Block {
  return {
    id: 'test-blog-card-id',
    type: 'blog-card',
    props: {
      thumbnail: 'https://placehold.co/800x450',
      publishDate: '2026-07-10',
      postUrl: 'https://example.com/post',
      imageAspectRatio: '16:9',
      linkTarget: '_self',
      cardBackgroundColor: '#ffffff',
      cardBorderColor: '#e5e7eb',
      cardBorderRadius: '12px',
      cardPadding: '20px',
      cardShadow: 'sm',
      hoverEffect: 'lift',
    },
    i18nProps: {
      title: { [LOCALES.EN]: 'Blog post title' },
      excerpt: { [LOCALES.EN]: 'A short excerpt of the article goes here.' },
      authorName: { [LOCALES.EN]: 'Author Name' },
      readMoreLabel: { [LOCALES.EN]: 'Read more' },
      category: { [LOCALES.EN]: 'News' },
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

test('blog-card block is fully registered', () => {
  const def = getBlockDefinition('blog-card');
  expect(def).toBeDefined();
  expect(def!.CanvasComponent).toBeDefined();
  expect(def!.ContentFields).toBeDefined();
  expect(def!.StyleFields).toBeDefined();
  expect(def!.renderToHtml).toBeDefined();
  expect(def!.propsSchema).toBeDefined();
  expect(def!.isContainer).toBeFalsy();
  expect(() => def!.renderToHtml(mockBlogCardBlock(), mockCtx())).not.toThrow();
});

test('blog-card propsSchema parses defaultProps and rejects invalid enums', () => {
  const def = getBlockDefinition('blog-card');
  expect(def?.propsSchema).toBeDefined();
  expect(() => def!.propsSchema!.parse(def!.defaultProps)).not.toThrow();
  expect(() => def!.propsSchema!.parse({ imageAspectRatio: '21:9' })).toThrow();
  expect(() => def!.propsSchema!.parse({ cardShadow: 'xl' })).toThrow();
  expect(() => def!.propsSchema!.parse({ hoverEffect: 'bounce' })).toThrow();
});

test('blog-card export includes noopener for _blank and applies custom styles', () => {
  const def = getBlockDefinition('blog-card');
  expect(def).toBeDefined();
  const html = def!.renderToHtml(
    mockBlogCardBlock({
      props: {
        thumbnail: 'https://placehold.co/800x450',
        publishDate: '2026-07-10',
        postUrl: 'https://example.com/post',
        imageAspectRatio: '16:9',
        linkTarget: '_blank',
        cardBackgroundColor: '#fafafa',
        cardBorderColor: '#ddd',
        cardBorderRadius: '16px',
        cardPadding: '24px',
        cardShadow: 'md',
        hoverEffect: 'lift',
        titleStyle: JSON.stringify({
          color: '#111111',
          fontWeight: '700',
          fontFamily: 'Playfair Display',
        }),
        readMoreStyle: JSON.stringify({ color: '#dc2626' }),
      },
    }),
    mockCtx(),
  );
  expect(html).toMatch(/target="_blank"/);
  expect(html).toMatch(/rel="noopener noreferrer"/);
  expect(html).toMatch(/#111111/);
  expect(html).toMatch(/#dc2626/);
  expect(html).toMatch(/background-color:#fafafa/);
  expect(html).toMatch(/Read more/);
  expect(html).toMatch(/font-family:"Playfair Display"/);
  expect(html).toMatch(/font-family:inherit/);
});
