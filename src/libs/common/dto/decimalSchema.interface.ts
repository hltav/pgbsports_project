import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

export const decimalSchema = z.preprocess((val) => {
  if (val === null || val === undefined || val === '') return undefined;
  if (typeof val === 'string' || typeof val === 'number') {
    return new Decimal(val);
  }
  return val;
}, z.instanceof(Decimal));

export type DecimalSchemaType = z.infer<typeof decimalSchema>;
