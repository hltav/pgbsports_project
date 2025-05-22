export interface IPasswordCrypto {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface IJwtCrypto<T> {
  sign(payload: T, options?: { expiresIn?: string | number }): string;
  verify(token: string): T;
}
