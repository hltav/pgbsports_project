import * as crypto from 'crypto';

export const createEmailHash = (email: string): string => {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
};
