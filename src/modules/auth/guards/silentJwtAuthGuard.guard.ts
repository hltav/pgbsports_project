/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';

@Injectable()
export class SilentJwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = any>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const url = typeof req.url === 'string' ? req.url : '';
    if (url.includes('/logout')) {
      return (user ?? null) as TUser; // ✅ conversão segura
    }

    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }

    return user;
  }
}
