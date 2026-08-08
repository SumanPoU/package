import { z } from 'zod';

export const IconBoxPropsSchema = z.object({
  iconName: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type IconBoxProps = z.infer<typeof IconBoxPropsSchema>;
