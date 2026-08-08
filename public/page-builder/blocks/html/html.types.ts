import { z } from 'zod';

export const HtmlPropsSchema = z.object({
  code: z.string().optional(),
});

export type HtmlProps = z.infer<typeof HtmlPropsSchema>;
