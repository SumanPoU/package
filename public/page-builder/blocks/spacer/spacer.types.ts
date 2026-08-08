import { z } from 'zod';

export const SpacerPropsSchema = z.object({
  height: z.string().optional(),
});

export type SpacerProps = z.infer<typeof SpacerPropsSchema>;
