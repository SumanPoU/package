import { z } from "zod";

import { PAGE_SCHEMA_VERSION } from "../../constants";
import type { BlockRegistry } from "../registry";
import { createBlockSchema } from "./block";
import { customScriptSchema } from "./locale";

type PageSchemaOptions = {
  registry?: BlockRegistry;
  allowUnknownTypes?: boolean;
  /** Expected schemaVersion; defaults to current engine version. */
  schemaVersion?: number;
};

export const pageMetaSchema = z.record(z.string(), z.unknown());

export const createPageSchema = (options: PageSchemaOptions = {}) => {
  const expectedVersion = options.schemaVersion ?? PAGE_SCHEMA_VERSION;
  const blockSchema = createBlockSchema({
    registry: options.registry,
    allowUnknownTypes: options.allowUnknownTypes,
  });

  return z
    .object({
      id: z.string().min(1),
      blocks: z.array(blockSchema),
      meta: pageMetaSchema.default({}),
      globalCss: z.string().optional(),
      globalJs: z
        .union([customScriptSchema, z.array(customScriptSchema)])
        .optional(),
      schemaVersion: z.number().int().nonnegative(),
      revision: z.string().optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.schemaVersion !== expectedVersion) {
        // Loud, not silent — host should migrate before parse in later phases.
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unsupported schemaVersion ${value.schemaVersion}; expected ${expectedVersion}`,
          path: ["schemaVersion"],
        });
      }
    });
};

export const pageSchema = createPageSchema({ allowUnknownTypes: true });
