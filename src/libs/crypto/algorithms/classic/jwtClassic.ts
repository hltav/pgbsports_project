// import { Injectable } from '@nestjs/common';
// import { JwtService as NestJwtService } from '@nestjs/jwt';
// import { JwtServiceInterface } from './../../interfaces/crypto.interface';
// import { JwtPayload } from '../../../../modules/auth/dto/jwt-payload.dto';

// @Injectable()
// export class JwtClassic implements JwtServiceInterface {
//   constructor(private readonly jwtService: NestJwtService) {}

//   sign(payload: JwtPayload, options?: { expiresIn: string }): string {
//     return this.jwtService.sign(payload, options);
//   }

//   verify(token: string): JwtPayload {
//     return this.jwtService.verify(token);
//   }
// }

import { JwtService } from '@nestjs/jwt';
import { IJwtCrypto } from './../../interfaces/crypto.interface';
import { JwtPayload } from '../../../../modules/auth/dto/jwt-payload.dto';

export class JwtClassic implements IJwtCrypto<JwtPayload> {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: JwtPayload, options?: { expiresIn?: string | number }): string {
    return this.jwtService.sign(payload, options);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }
}
