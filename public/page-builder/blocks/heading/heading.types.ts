import { z } from 'zod';

export const HeadingPropsSchema = z.object({
  text: z.string().optional(),
  level: z.enum(['1', '2', '3', '4', '5', '6']).optional(),
});

export type HeadingProps = z.infer<typeof HeadingPropsSchema>;
