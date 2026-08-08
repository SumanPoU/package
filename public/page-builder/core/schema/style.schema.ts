import { z } from 'zod';

const SpacingUnitSchema = z.enum(['px', 'em', 'rem', '%']);

export const SpacingValueSchema = z.object({
  top: z.string(),
  right: z.string(),
  bottom: z.string(),
  left: z.string(),
  unit: SpacingUnitSchema,
  linked: z.boolean(),
});

export const BorderRadiusValueSchema = z.object({
  topLeft: z.string(),
  topRight: z.string(),
  bottomRight: z.string(),
  bottomLeft: z.string(),
  unit: z.enum(['px', 'em', '%']),
  linked: z.boolean(),
});

export const BoxShadowSchema = z.object({
  enabled: z.boolean(),
  x: z.string(),
  y: z.string(),
  blur: z.string(),
  spread: z.string(),
  color: z.string(),
  inset: z.boolean(),
});

export const DimensionValueSchema = z.object({
  value: z.number().nullable(),
  unit: z.enum(['px', '%', 'auto', 'vh', 'vw']),
});

export const GapValueSchema = z.object({
  row: z.number().nullable(),
  column: z.number().nullable(),
  linked: z.boolean(),
  unit: z.enum(['px', 'em', 'rem', 'vw', 'vh']),
});

export const AdvancedStyleSchema = z.object({
  align: z.enum(['left', 'center', 'right']),
  paddingY: z.enum(['none', 'sm', 'md', 'lg']),
  bg: z.enum(['none', 'gray', 'dark']),
  columns: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
    .optional(),
  gridTemplateColumns: z.string().optional(),

  flexDirection: z.enum(['row', 'row-reverse', 'column', 'column-reverse']).optional(),
  justifyContent: z
    .enum(['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'])
    .optional(),
  alignItems: z.enum(['stretch', 'flex-start', 'center', 'flex-end', 'baseline']).optional(),
  gap: GapValueSchema.optional(),

  width: z.enum(['full', 'boxed']).optional(),
  height: z.enum(['auto', 'full', 'custom']).optional(),
  customHeight: z.string().optional(),

  dimWidth: DimensionValueSchema.optional(),
  dimHeight: DimensionValueSchema.optional(),
  minWidth: DimensionValueSchema.optional(),
  maxWidth: DimensionValueSchema.optional(),
  minHeight: DimensionValueSchema.optional(),
  maxHeight: DimensionValueSchema.optional(),

  margin: SpacingValueSchema,
  padding: SpacingValueSchema,

  fontFamily: z.string().optional(),
  fontSize: z.string(),
  fontSizeUnit: z.enum(['px', 'em', 'rem', 'vw']),
  fontWeight: z.string(),
  lineHeight: z.string(),
  letterSpacing: z.string(),
  letterSpacingUnit: z.enum(['px', 'em']),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']),
  textDecoration: z.enum(['none', 'underline', 'line-through']),
  textColor: z.string(),

  backgroundColor: z.string(),
  backgroundImage: z.string().optional(),
  backgroundSize: z.enum(['cover', 'contain', 'auto']).optional(),
  backgroundPosition: z.string().optional(),
  backgroundRepeat: z.enum(['no-repeat', 'repeat', 'repeat-x', 'repeat-y']).optional(),
  backgroundOverlay: z
    .object({
      color: z.string(),
      opacity: z.number(),
    })
    .nullable()
    .optional(),

  borderWidth: SpacingValueSchema,
  borderStyle: z.enum(['none', 'solid', 'dashed', 'dotted', 'double']),
  borderColor: z.string(),
  borderRadius: BorderRadiusValueSchema,
  opacity: z.string(),
  boxShadow: BoxShadowSchema,
  customCSS: z.string(),

  objectFit: z.enum(['fill', 'contain', 'cover', 'none', 'scale-down']).optional(),
  filterBlur: z.string().optional(),
  imageShadowPreset: z.enum(['none', 'soft', 'medium', 'strong', 'custom']).optional(),
});

export const DeviceVisibilitySchema = z.object({
  desktop: z.boolean(),
  tablet: z.boolean(),
  mobile: z.boolean(),
});

export const ResponsiveOverridesSchema = z.object({
  desktop: AdvancedStyleSchema.partial().optional(),
  tablet: AdvancedStyleSchema.partial().optional(),
  mobile: AdvancedStyleSchema.partial().optional(),
});
