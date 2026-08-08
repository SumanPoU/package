import { z } from 'zod';

export const HeroPropsSchema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundColor: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  ctaTarget: z.enum(['_self', '_blank']).optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
  overlayOpacity: z.string().optional(),
});

export type HeroProps = z.infer<typeof HeroPropsSchema>;
