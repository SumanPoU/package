import { z } from 'zod';

export const IconPropsSchema = z.object({
  iconName: z.string().optional(),
});

export type IconProps = z.infer<typeof IconPropsSchema>;
