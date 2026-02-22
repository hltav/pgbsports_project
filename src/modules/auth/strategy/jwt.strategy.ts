import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { FastifyRequest } from 'fastify';
import { AuthContext } from './../../../modules/users/proxies/serviceProxies/users-finders.proxy.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is missing');
    }

    function cookieExtractor(req: FastifyRequest): string | null {
      return req.cookies?.access_token || null;
    }

    const jwtFromRequest = ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      cookieExtractor,
    ]);

    super({
      jwtFromRequest,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const authenticatedCaller: AuthContext = {
      id: payload.sub,
      role: payload.role, // já obrigatório agora que removemos o optional()
    };

    const user = await this.usersService.findUserById(
      payload.sub,
      authenticatedCaller,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      role: payload.role,
      sub: payload.sub,
    };
  }
}
