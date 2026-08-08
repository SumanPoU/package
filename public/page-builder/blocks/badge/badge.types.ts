import { z } from 'zod';

export const BadgePropsSchema = z.object({
  text: z.string().optional(),
});

export type BadgeProps = z.infer<typeof BadgePropsSchema>;
