import { z } from 'zod';

export const TextPropsSchema = z.object({
  text: z.string().optional(),
});

export type TextProps = z.infer<typeof TextPropsSchema>;
