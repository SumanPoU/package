import { z } from 'zod';

const TextStyleObjectSchema = z.object({
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  fontStyle: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  letterSpacing: z.string().optional(),
  lineHeight: z.string().optional(),
});

export const TextStyleSchema = TextStyleObjectSchema.optional();

export type TextStyle = z.infer<typeof TextStyleObjectSchema>;

/** Accepts object (in-memory / defaultProps) or JSON string (OnChangeShared / persistence). */
export const TextStylePropSchema = z.union([
  TextStyleObjectSchema,
  z.string().transform((raw, ctx) => {
    if (!raw.trim()) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as TextStyle;
      }
      ctx.addIssue({ code: 'custom', message: 'Invalid TextStyle JSON' });
      return z.NEVER;
    } catch {
      ctx.addIssue({ code: 'custom', message: 'Invalid TextStyle JSON' });
      return z.NEVER;
    }
  }),
]);

export const BlogCardPropsSchema = z.object({
  thumbnail: z.string().optional(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  authorName: z.string().optional(),
  publishDate: z.string().optional(),
  readMoreLabel: z.string().optional(),
  category: z.string().optional(),
  imageAspectRatio: z.enum(['16:9', '4:3', '1:1']).optional(),

  postUrl: z.string().optional(),
  linkTarget: z.enum(['_self', '_blank']).optional(),

  cardBackgroundColor: z.string().optional(),
  cardBorderColor: z.string().optional(),
  cardBorderRadius: z.string().optional(),
  cardPadding: z.string().optional(),
  cardShadow: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  hoverEffect: z.enum(['none', 'lift', 'zoom-image', 'shadow-grow']).optional(),

  titleStyle: TextStylePropSchema.optional(),
  excerptStyle: TextStylePropSchema.optional(),
  authorStyle: TextStylePropSchema.optional(),
  dateStyle: TextStylePropSchema.optional(),
  categoryStyle: TextStylePropSchema.optional(),
  readMoreStyle: TextStylePropSchema.optional(),
});

export type BlogCardProps = z.infer<typeof BlogCardPropsSchema>;
