import { z } from "zod";

export const deviceSchema = z.enum(["desktop", "tablet", "mobile"]);

export const customScriptSchema = z.object({
  code: z.string(),
  runAt: z.enum(["domReady", "afterHydration"]),
  enabled: z.boolean(),
});

export const blockVisibilitySchema = z
  .object({
    hiddenOnCanvas: z.boolean().optional(),
    hiddenOnPublish: z.boolean().optional(),
    hiddenDevices: z.array(deviceSchema).optional(),
    hiddenLocales: z.array(z.string()).optional(),
  })
  .strict();

export const visibilityPredicateSchema = z
  .object({
    key: z.string().min(1),
    equals: z.unknown().optional(),
    notEquals: z.unknown().optional(),
    between: z.tuple([z.string(), z.string()]).optional(),
  })
  .strict();

export const visibleWhenSchema = z
  .object({
    allOf: z.array(visibilityPredicateSchema).optional(),
    anyOf: z.array(visibilityPredicateSchema).optional(),
  })
  .strict();

export const i18nPropsSchema = z.record(
  z.string(),
  z.record(z.string(), z.unknown()),
);

export const localeDefinitionSchema = z
  .object({
    code: z.string().min(1),
    label: z.string().min(1),
    dir: z.enum(["ltr", "rtl"]),
    flatSuffixes: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const localeConfigSchema = z
  .object({
    locales: z.array(localeDefinitionSchema).min(1),
    defaultLocale: z.string().min(1),
    fallbackLocale: z.string().min(1),
    localeStorage: z.enum(["nested", "flat"]),
    strictFlatKeys: z.boolean().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const codes = new Set(value.locales.map((l) => l.code));
    if (!codes.has(value.defaultLocale)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `defaultLocale "${value.defaultLocale}" is not in locales`,
        path: ["defaultLocale"],
      });
    }
    if (!codes.has(value.fallbackLocale)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `fallbackLocale "${value.fallbackLocale}" is not in locales`,
        path: ["fallbackLocale"],
      });
    }
  });
