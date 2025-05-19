// import { Injectable } from '@nestjs/common';
// import { PasswordBcrypt } from './../algorithms/classic/passwordBcrypt';

// @Injectable()
// export class PasswordService {
//   constructor(private readonly passwordBcrypt: PasswordBcrypt) {}

//   async hash(password: string): Promise<string> {
//     return this.passwordBcrypt.hash(password);
//   }

//   async compare(password: string, hash: string): Promise<boolean> {
//     return this.passwordBcrypt.compare(password, hash);
//   }
// }

import { Injectable } from '@nestjs/common';
import { PasswordBcrypt } from './../algorithms/classic/passwordBcrypt';

@Injectable()
export class PasswordService {
  private strategy = new PasswordBcrypt();

  hash(password: string): Promise<string> {
    return this.strategy.hash(password);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return this.strategy.compare(password, hash);
  }
}
