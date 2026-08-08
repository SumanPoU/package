import { z } from 'zod';

export const ImagePropsSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
});

export type ImageProps = z.infer<typeof ImagePropsSchema>;
