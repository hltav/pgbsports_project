import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload, JwtPayloadSchema } from '../dto/jwt-payload.dto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const user = await this.usersService.findUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Valida o usuário com Zod
      const parsed = JwtPayloadSchema.safeParse({
        sub: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      });

      if (!parsed.success) {
        throw new UnauthorizedException('User data inválido');
      }

      const accessToken = this.jwtService.sign(parsed.data, {
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(parsed.data, {
        expiresIn: '7d',
      });

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
