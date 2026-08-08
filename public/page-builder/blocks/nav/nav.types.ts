import { z } from 'zod';

export const NavPropsSchema = z.object({
  links: z.string().optional(),
});

export type NavProps = z.infer<typeof NavPropsSchema>;
