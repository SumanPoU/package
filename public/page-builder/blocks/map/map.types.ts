import { z } from 'zod';

export const MapPropsSchema = z.object({
  address: z.string().optional(),
});

export type MapProps = z.infer<typeof MapPropsSchema>;
