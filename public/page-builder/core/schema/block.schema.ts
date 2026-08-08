import { z } from 'zod';

import type { Block } from '../../types';
import { listBlocks } from '../registry';
import {
  AdvancedStyleSchema,
  DeviceVisibilitySchema,
  ResponsiveOverridesSchema,
} from './style.schema';

import '../../blocks';

const I18nPropsSchema = z.record(z.string(), z.record(z.string(), z.string()));

const RepeatableItemsSchema = z
  .array(
    z.object({
      id: z.string(),
      props: z.record(z.string(), z.string()),
    }),
  )
  .optional();

const LoosePropsSchema = z.record(z.string(), z.string());

function propsSchemaForBlock(
  propsSchema: z.ZodType<Record<string, string>> | undefined,
): z.ZodType<Record<string, string>> {
  return propsSchema ?? LoosePropsSchema;
}

function buildBlockVariants(blockSchema: z.ZodType<Block>) {
  const defs = listBlocks();
  if (defs.length < 2) {
    throw new Error('[page-builder] BlockSchema requires at least two registered block types.');
  }

  return defs.map((def) =>
    z.object({
      id: z.string(),
      type: z.literal(def.type),
      props: propsSchemaForBlock(def.propsSchema as z.ZodType<Record<string, string>> | undefined),
      i18nProps: I18nPropsSchema,
      style: AdvancedStyleSchema,
      visibility: DeviceVisibilitySchema,
      responsiveStyle: ResponsiveOverridesSchema,
      repeatableItems: RepeatableItemsSchema,
      children: z.array(blockSchema).optional(),
    }),
  );
}

export const BlockSchema = z.lazy(() =>
  z.discriminatedUnion(
    'type',
    buildBlockVariants(BlockSchema) as unknown as [
      z.ZodObject<{ type: z.ZodTypeAny }>,
      z.ZodObject<{ type: z.ZodTypeAny }>,
      ...z.ZodObject<{ type: z.ZodTypeAny }>[],
    ],
  ),
) as unknown as z.ZodType<Block>;

export function validateBlockTree(blocks: unknown): Block[] {
  return z.array(BlockSchema).parse(blocks);
}

export function formatBlockTreeValidationError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Page content failed validation.';
  const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
  return `${path}: ${issue.message}`;
}
