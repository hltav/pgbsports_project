import { SetMetadata } from '@nestjs/common';

export const ENCRYPTED_FIELDS = 'encryptedFields';
export const Encrypted = () => SetMetadata(ENCRYPTED_FIELDS, true);
