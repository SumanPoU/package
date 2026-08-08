import { z } from 'zod';

export const QuotePropsSchema = z.object({
  text: z.string().optional(),
  author: z.string().optional(),
});

export type QuoteProps = z.infer<typeof QuotePropsSchema>;
