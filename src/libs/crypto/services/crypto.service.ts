import { Injectable } from '@nestjs/common';
import { PasswordService } from './password.service';
import { JwtHandlerService } from './jwt.service';
import { JwtPayload } from '../../../modules/auth/dto/jwt-payload.dto';

@Injectable()
export class CryptoService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtHandlerService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return this.passwordService.hash(password);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return this.passwordService.compare(password, hash);
  }

  signJwt(payload: JwtPayload, options?: { expiresIn?: string }) {
    return this.jwtService.sign(payload, options);
  }

  verifyJwt(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
