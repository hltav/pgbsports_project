import { z } from 'zod';

declare global {
  type ZodInfer<T extends z.ZodType<any, any, any>> = z.infer<T>;
}
