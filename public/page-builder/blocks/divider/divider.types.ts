import { z } from 'zod';

export const DividerPropsSchema = z.object({});

export type DividerProps = z.infer<typeof DividerPropsSchema>;
