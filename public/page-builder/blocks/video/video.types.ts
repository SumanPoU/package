import { z } from 'zod';

export const VideoPropsSchema = z.object({
  url: z.string().optional(),
});

export type VideoProps = z.infer<typeof VideoPropsSchema>;
