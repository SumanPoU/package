import { z } from 'zod';

export const GridPropsSchema = z.object({});

export type GridProps = z.infer<typeof GridPropsSchema>;
