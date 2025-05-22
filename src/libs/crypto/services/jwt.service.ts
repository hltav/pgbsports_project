import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtClassic } from './../algorithms/classic/jwtClassic';
import { JwtPayload } from '../../../modules/auth/dto/jwt-payload.dto';

@Injectable()
export class JwtHandlerService {
  private strategy: JwtClassic;

  constructor(private readonly nestJwtService: NestJwtService) {
    this.strategy = new JwtClassic(this.nestJwtService);
  }

  sign(payload: JwtPayload, options?: { expiresIn?: string | number }): string {
    return this.strategy.sign(payload, options);
  }

  verify(token: string): JwtPayload {
    return this.strategy.verify(token);
  }
}
