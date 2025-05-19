// import { JwtPayload } from '../../../modules/auth/dto/jwt-payload.dto';

// // src/lib/crypto/crypto.interface.ts
// export interface PasswordServiceInterface {
//   hash(password: string): Promise<string>;
//   compare(password: string, hash: string): Promise<boolean>;
// }

// export interface JwtServiceInterface {
//   sign(payload: JwtPayload, options?: { expiresIn: string }): string;
//   verify(token: string): JwtPayload;
// }

export interface IPasswordCrypto {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface IJwtCrypto<T> {
  sign(payload: T, options?: { expiresIn?: string | number }): string;
  verify(token: string): T;
}
