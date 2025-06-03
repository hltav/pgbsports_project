import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

export const decimalSchema = z.preprocess((val) => {
  if (typeof val === 'string' || typeof val === 'number') {
    return new Decimal(val);
  }
  return val;
}, z.instanceof(Decimal));
