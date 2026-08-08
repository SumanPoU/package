import { z } from 'zod';

export const CounterPropsSchema = z.object({
  targetNumber: z.string().optional(),
  label: z.string().optional(),
});

export type CounterProps = z.infer<typeof CounterPropsSchema>;
