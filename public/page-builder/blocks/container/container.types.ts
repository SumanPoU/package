import { z } from 'zod';

export const ContainerPropsSchema = z.object({});

export type ContainerProps = z.infer<typeof ContainerPropsSchema>;
