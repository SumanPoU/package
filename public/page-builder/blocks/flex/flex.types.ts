import { z } from 'zod';

export const FlexPropsSchema = z.object({});

export type FlexProps = z.infer<typeof FlexPropsSchema>;
