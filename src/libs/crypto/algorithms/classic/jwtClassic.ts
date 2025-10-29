// import { JwtService } from '@nestjs/jwt';
// import { IJwtCrypto } from './../../interfaces/crypto.interface';
// import { JwtPayload } from '../../../../modules/auth/dto/jwt-payload.dto';
// import { SignOptions } from 'jsonwebtoken';

// export class JwtClassic implements IJwtCrypto<JwtPayload> {
//   constructor(private readonly jwtService: JwtService) {}

//   sign(payload: JwtPayload, options?: SignOptions): string {
//     return this.jwtService.sign(payload, options);
//   }

//   verify(token: string): JwtPayload {
//     return this.jwtService.verify<JwtPayload>(token);
//   }
// }

import { JwtService } from '@nestjs/jwt';
import { IJwtCrypto } from './../../interfaces/crypto.interface';
import { JwtPayload } from '../../../../modules/auth/dto/jwt-payload.dto';
import { SignOptions } from 'jsonwebtoken';

export class JwtClassic implements IJwtCrypto<JwtPayload> {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: JwtPayload, options?: { expiresIn?: string | number }): string {
    // converte string tipo '1h' ou '30m' para segundos
    let expiresIn: number | undefined;

    if (options?.expiresIn !== undefined) {
      if (typeof options.expiresIn === 'string') {
        expiresIn = this.parseDurationToSeconds(options.expiresIn);
      } else {
        expiresIn = options.expiresIn;
      }
    }

    const signOptions: SignOptions = { expiresIn };

    return this.jwtService.sign(payload, signOptions);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token);
  }

  private parseDurationToSeconds(duration: string | number): number {
    if (typeof duration === 'number') return duration; // já em segundos

    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid duration format: ${duration}`);

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 3600 * 24;
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }
}
