import * as bcrypt from 'bcrypt';
import { IPasswordCrypto } from './../../interfaces/crypto.interface';

export class PasswordBcrypt implements IPasswordCrypto {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
