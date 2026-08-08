import { z } from 'zod';

export const CodePropsSchema = z.object({
  code: z.string().optional(),
  language: z.string().optional(),
});

export type CodeProps = z.infer<typeof CodePropsSchema>;
