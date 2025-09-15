import { z } from 'zod';
import { SafeInfer } from './../../../types/zod';
import { sensitiveString } from './../../../libs/common/zod/sensitive';

export const CreateAddressDto = z.object({
  direction: sensitiveString().optional(),
  houseNumber: sensitiveString().optional(),
  neighborhood: sensitiveString().optional(),
  city: sensitiveString().optional(),
  state: sensitiveString().optional(),
  country: sensitiveString().optional(),
});

export type CreateAddressDTO = SafeInfer<typeof CreateAddressDto>;
