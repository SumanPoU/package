import { z } from 'zod';

export const IframePropsSchema = z.object({
  url: z.string().optional(),
});

export type IframeProps = z.infer<typeof IframePropsSchema>;
