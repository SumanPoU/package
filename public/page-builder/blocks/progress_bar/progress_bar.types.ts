import { z } from 'zod';

export const ProgressBarPropsSchema = z.object({
  percentage: z.string().optional(),
  label: z.string().optional(),
});

export type ProgressBarProps = z.infer<typeof ProgressBarPropsSchema>;
