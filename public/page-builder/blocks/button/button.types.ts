import { z } from 'zod';

export const ButtonPropsSchema = z.object({
  text: z.string().optional(),
  href: z.string().optional(),
  target: z.enum(['_self', '_blank']).optional(),
});

export type ButtonProps = z.infer<typeof ButtonPropsSchema>;
