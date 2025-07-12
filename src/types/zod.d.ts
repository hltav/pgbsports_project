/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

declare module 'zod' {
  export interface ZodType<
    Output = any,
    Def extends ZodTypeDef = ZodTypeDef,
    Input = Output,
  > {
    _schema: true;
  }
}

export type SafeInfer<T extends z.ZodType<any, any, any>> = z.infer<T>;
