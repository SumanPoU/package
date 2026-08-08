import { LOCALES } from '@/config/languages';
import { expect, test } from 'vitest';

import { DEFAULT_STYLE, DEFAULT_VISIBILITY, COMPONENT_LIBRARY } from '../constants';
import type { Block, ComponentType } from '../types';
import { getBlockDefinition, listBlocks } from './registry';

import '../blocks';

function mockBlockFromDefinition(type: ComponentType): Block {
  const def = getBlockDefinition(type);
  if (!def) {
    throw new Error(`Missing block definition for "${type}"`);
  }

  return {
    id: `drift-${type}`,
    type,
    props: { ...(def.defaultProps as Record<string, string>) },
    i18nProps: {},
    style: { ...DEFAULT_STYLE, ...(def.defaultStyle ?? {}) },
    visibility: { ...DEFAULT_VISIBILITY },
    responsiveStyle: {},
  };
}

test('every registered block has required definition fields', () => {
  const blocks = listBlocks();
  expect(blocks.length).toBeGreaterThan(0);

  for (const def of blocks) {
    expect(def.type, `${def.type}: type`).toBeTruthy();
    expect(def.label, `${def.type}: label`).toBeTruthy();
    expect(def.icon, `${def.type}: icon`).toBeDefined();
    expect(def.category, `${def.type}: category`).toBeTruthy();
    expect(def.defaultProps, `${def.type}: defaultProps`).toBeDefined();
    expect(Array.isArray(def.translatableProps), `${def.type}: translatableProps`).toBe(true);
    expect(Array.isArray(def.sharedProps), `${def.type}: sharedProps`).toBe(true);
    expect(def.CanvasComponent, `${def.type}: CanvasComponent`).toBeDefined();
    expect(def.ContentFields, `${def.type}: ContentFields`).toBeDefined();
    expect(typeof def.renderToHtml, `${def.type}: renderToHtml`).toBe('function');
    expect(def.propsSchema, `${def.type}: propsSchema`).toBeDefined();
  }
});

test('every registered block renderToHtml accepts default props without throwing', () => {
  for (const def of listBlocks()) {
    expect(() =>
      def.renderToHtml(mockBlockFromDefinition(def.type), { lang: LOCALES.EN }),
    ).not.toThrow();
  }
});

test('COMPONENT_LIBRARY and registry stay in sync', () => {
  const registered = new Set(listBlocks().map((def) => def.type));
  const library = new Set(COMPONENT_LIBRARY.map((item) => item.type));

  expect(registered.size).toBe(library.size);

  for (const type of library) {
    expect(registered.has(type), `COMPONENT_LIBRARY type "${type}" missing from registry`).toBe(
      true,
    );
  }

  for (const type of registered) {
    expect(library.has(type), `registry type "${type}" missing from COMPONENT_LIBRARY`).toBe(true);
  }
});
