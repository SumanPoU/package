import { z } from 'zod';

export const AlertPropsSchema = z.object({
  variant: z.enum(['info', 'success', 'warning', 'error']).optional(),
  title: z.string().optional(),
  text: z.string().optional(),
});

export type AlertProps = z.infer<typeof AlertPropsSchema>;
