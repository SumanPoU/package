import { z } from 'zod';

export const ListPropsSchema = z.object({
  items: z.string().optional(),
  listType: z
    .enum(['unordered', 'ordered', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman'])
    .optional(),
});

export type ListProps = z.infer<typeof ListPropsSchema>;
