import { expect, test } from 'vitest';
import { ZodError } from 'zod';

import { DEFAULT_STYLE, DEFAULT_VISIBILITY } from '../../constants';
import { listBlocks } from '../registry';
import type { ComponentType } from '../../types';
import { validateBlockTree } from './block.schema';

import '../../blocks';

function minimalBlock(type: ComponentType, overrides: Record<string, unknown> = {}) {
  return {
    id: `test-${type}`,
    type,
    props: {},
    i18nProps: {},
    style: DEFAULT_STYLE,
    visibility: { ...DEFAULT_VISIBILITY },
    responsiveStyle: {},
    ...overrides,
  };
}

test('BlockSchema accepts all 23 registered block types', () => {
  const types = listBlocks().map((def) => def.type);
  expect(types).toHaveLength(23);

  for (const type of types) {
    expect(() => validateBlockTree([minimalBlock(type)])).not.toThrow();
  }
});

test('BlockSchema rejects unknown or removed block types', () => {
  expect(() =>
    validateBlockTree([
      {
        ...minimalBlock('heading'),
        type: 'form_block',
      },
    ]),
  ).toThrow(ZodError);
});

test('validateBlockTree round-trips a container tree with children', () => {
  const tree = [
    minimalBlock('container', {
      id: 'container-1',
      children: [
        minimalBlock('heading', {
          id: 'heading-1',
          props: { text: 'Hello', level: '2' },
        }),
        minimalBlock('text', {
          id: 'text-1',
          props: { content: '<p>Body</p>' },
        }),
      ],
    }),
  ];

  const result = validateBlockTree(tree);
  expect(result).toHaveLength(1);
  expect(result[0]?.type).toBe('container');
  expect(result[0]?.children).toHaveLength(2);
  expect(result[0]?.children?.[0]?.type).toBe('heading');
  expect(result[0]?.children?.[1]?.type).toBe('text');
});

test('BlockSchema uses per-block propsSchema for nav, list, and html', () => {
  expect(() =>
    validateBlockTree([
      minimalBlock('nav', { props: { links: 'Home,/' } }),
      minimalBlock('list', { props: { items: 'A', listType: 'ordered' } }),
      minimalBlock('html', { props: { code: '<p>ok</p>' } }),
    ]),
  ).not.toThrow();

  expect(() =>
    validateBlockTree([minimalBlock('list', { props: { listType: 'diamond' } })]),
  ).toThrow(ZodError);

  expect(() => validateBlockTree([minimalBlock('html', { props: { code: 123 } })])).toThrow(
    ZodError,
  );

  expect(() => validateBlockTree([minimalBlock('nav', { props: { links: 123 } })])).toThrow(
    ZodError,
  );
});

test('BlockSchema uses per-block propsSchema for image, video, map, and iframe', () => {
  expect(() =>
    validateBlockTree([
      minimalBlock('image', { props: { src: 'https://placehold.co/1', alt: 'a' } }),
      minimalBlock('video', { props: { url: 'https://example.com/v' } }),
      minimalBlock('map', { props: { address: 'Kathmandu' } }),
      minimalBlock('iframe', { props: { url: 'https://example.com' } }),
    ]),
  ).not.toThrow();

  expect(() => validateBlockTree([minimalBlock('image', { props: { src: 123 } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('video', { props: { url: 123 } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('map', { props: { address: 123 } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('iframe', { props: { url: 123 } })])).toThrow(
    ZodError,
  );
});

test('BlockSchema uses per-block propsSchema for container, flex, and grid', () => {
  expect(() =>
    validateBlockTree([
      minimalBlock('container', { props: {} }),
      minimalBlock('flex', { props: {} }),
      minimalBlock('grid', { props: {} }),
    ]),
  ).not.toThrow();

  expect(() => validateBlockTree([minimalBlock('container', { props: 123 })])).toThrow(ZodError);
  expect(() => validateBlockTree([minimalBlock('flex', { props: [] })])).toThrow(ZodError);
  expect(() => validateBlockTree([minimalBlock('grid', { props: null })])).toThrow(ZodError);
});

test('BlockSchema uses per-block propsSchema for heading, text, button, and badge', () => {
  expect(() =>
    validateBlockTree([
      minimalBlock('heading', { props: { text: 'Hi', level: '2' } }),
      minimalBlock('text', { props: { text: 'Body' } }),
      minimalBlock('button', { props: { text: 'Go', href: '', target: '_self' } }),
      minimalBlock('badge', { props: { text: 'New' } }),
    ]),
  ).not.toThrow();

  expect(() => validateBlockTree([minimalBlock('heading', { props: { level: '7' } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('button', { props: { target: '_top' } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('text', { props: { text: 123 } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('badge', { props: { text: 123 } })])).toThrow(
    ZodError,
  );
});

test('BlockSchema uses per-block propsSchema for divider, spacer, icon, quote, and alert', () => {
  expect(() =>
    validateBlockTree([
      minimalBlock('divider', { props: {} }),
      minimalBlock('spacer', { props: { height: '50' } }),
      minimalBlock('icon', { props: { iconName: 'Smile' } }),
      minimalBlock('quote', { props: { text: 'Q', author: 'A' } }),
      minimalBlock('alert', { props: { variant: 'info', title: 'T', text: 'M' } }),
    ]),
  ).not.toThrow();

  expect(() => validateBlockTree([minimalBlock('divider', { props: 123 })])).toThrow(ZodError);
  expect(() => validateBlockTree([minimalBlock('spacer', { props: { height: 123 } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('icon', { props: { iconName: 123 } })])).toThrow(
    ZodError,
  );
  expect(() => validateBlockTree([minimalBlock('quote', { props: { text: 123 } })])).toThrow(
    ZodError,
  );
  expect(() =>
    validateBlockTree([minimalBlock('alert', { props: { variant: 'critical' } })]),
  ).toThrow(ZodError);
});

test('BlockSchema uses per-block propsSchema for icon_box, star_rating, counter, and progress_bar', () => {
  expect(() =>
    validateBlockTree([
      minimalBlock('icon_box', {
        props: { iconName: 'Star', title: 'T', description: 'D' },
      }),
      minimalBlock('star_rating', { props: { rating: '4', maxRating: '5' } }),
      minimalBlock('counter', { props: { targetNumber: '100', label: 'C' } }),
      minimalBlock('progress_bar', { props: { percentage: '75', label: 'P' } }),
    ]),
  ).not.toThrow();

  expect(() => validateBlockTree([minimalBlock('icon_box', { props: { iconName: 123 } })])).toThrow(
    ZodError,
  );
  expect(() =>
    validateBlockTree([minimalBlock('star_rating', { props: { rating: 123 } })]),
  ).toThrow(ZodError);
  expect(() =>
    validateBlockTree([minimalBlock('counter', { props: { targetNumber: 123 } })]),
  ).toThrow(ZodError);
  expect(() =>
    validateBlockTree([minimalBlock('progress_bar', { props: { percentage: 123 } })]),
  ).toThrow(ZodError);
});
