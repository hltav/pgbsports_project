import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload, JwtPayloadSchema } from '../dto/jwt-payload.dto';
import { AuthContext } from './../../../modules/users/proxies/serviceProxies/users-finders.proxy.service';

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

      // Caller derivado do próprio payload do refresh token
      const authenticatedCaller: AuthContext = {
        id: payload.sub,
        role: payload.role,
      };

      const user = await this.usersService.findUserById(
        payload.sub,
        authenticatedCaller,
      );

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

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
