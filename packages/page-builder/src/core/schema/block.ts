import { z } from "zod";

import type { BlockRegistry } from "../registry";
import {
  blockVisibilitySchema,
  customScriptSchema,
  i18nPropsSchema,
  visibleWhenSchema,
} from "./locale";

type BlockSchemaOptions = {
  /** When set, `type` must be registered (live refine — ADR). */
  registry?: BlockRegistry;
  /** Allow unknown types (e.g. load-before-plugins). Default false when registry provided. */
  allowUnknownTypes?: boolean;
};

const blockBaseFields = {
  id: z.string().min(1),
  type: z.string().min(1),
  props: z.record(z.string(), z.unknown()).default({}),
  i18nProps: i18nPropsSchema.optional(),
  customCss: z.string().optional(),
  customJs: customScriptSchema.optional(),
  style: z.record(z.string(), z.unknown()).optional(),
  responsiveStyle: z.record(z.string(), z.unknown()).optional(),
  motion: z
    .object({
      entrance: z
        .enum([
          "none",
          "fadeIn",
          "fadeInUp",
          "fadeInDown",
          "fadeInLeft",
          "fadeInRight",
          "zoomIn",
          "slideInLeft",
          "slideInRight",
        ])
        .optional(),
      hover: z.enum(["none", "grow", "shrink", "float"]).optional(),
      durationMs: z.number().nonnegative().optional(),
      delayMs: z.number().nonnegative().optional(),
      trigger: z.enum(["load", "scroll"]).optional(),
    })
    .strict()
    .optional(),
  visibility: blockVisibilitySchema.optional(),
  visibleWhen: visibleWhenSchema.optional(),
};

export type BlockSchema = z.ZodTypeAny;

/**
 * Lazy recursive Block schema. Optional registry refine for `type`.
 */
export const createBlockSchema = (
  options: BlockSchemaOptions = {},
): z.ZodTypeAny => {
  const blockSchema: z.ZodTypeAny = z.lazy(() =>
    z
      .object({
        ...blockBaseFields,
        dataBinding: z
          .object({
            sourceId: z.string().min(1),
            params: z.record(z.string(), z.unknown()),
            itemTemplate: z.array(blockSchema),
          })
          .strict()
          .optional(),
        children: z.array(blockSchema).optional(),
      })
      .strict()
      .superRefine((value, ctx) => {
        if (!options.registry) return;
        if (options.allowUnknownTypes) return;
        if (!options.registry.has(value.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Unknown block type "${value.type}" — not in live registry`,
            path: ["type"],
          });
        }
      }),
  );

  return blockSchema;
};

/** Schema without registry refine (type is any non-empty string). */
export const blockSchema = createBlockSchema();
