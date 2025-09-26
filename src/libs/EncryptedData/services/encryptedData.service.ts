import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 12;

  private readonly masterKey: string;
  private readonly searchKey: string;

  constructor() {
    if (!process.env.ENCRYPTION_MASTER_KEY) {
      throw new Error('ENCRYPTION_MASTER_KEY não configurada');
    }
    if (!process.env.SEARCH_KEY) {
      throw new Error('SEARCH_KEY não configurada');
    }

    this.masterKey = process.env.ENCRYPTION_MASTER_KEY;
    this.searchKey = process.env.SEARCH_KEY;
  }

  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(this.ivLength);
    const key = Buffer.from(this.masterKey, 'hex');
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

    try {
      const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const key = Buffer.from(this.masterKey, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      console.log(
        'ivHex:',
        ivHex,
        'authTagHex:',
        authTagHex,
        'encrypted:',
        encrypted,
      );
      console.log('iv length:', iv.length);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      return encryptedText;
    }
  }

  generateSearchableHash(text: string): string {
    if (!text) return text;

    return crypto
      .createHmac('sha256', this.searchKey)
      .update(text.toLowerCase())
      .digest('hex');
  }
}
