import { z } from 'zod';

export const StarRatingPropsSchema = z.object({
  rating: z.string().optional(),
  maxRating: z.string().optional(),
});

export type StarRatingProps = z.infer<typeof StarRatingPropsSchema>;
