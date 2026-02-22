/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// import {
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { FastifyRequest } from 'fastify';

// @Injectable()
// export class SilentJwtAuthGuard extends AuthGuard('jwt') {
//   override handleRequest<TUser = any>(
//     err: unknown,
//     user: TUser,
//     info: unknown,
//     context: ExecutionContext,
//     status?: unknown,
//   ): TUser {
//     const req = context.switchToHttp().getRequest<FastifyRequest>();

//     const url = typeof req.url === 'string' ? req.url : '';
//     if (url.includes('/logout')) {
//       return (user ?? null) as TUser; // ✅ conversão segura
//     }

//     if (err || !user) {
//       throw err instanceof Error ? err : new UnauthorizedException();
//     }

//     return user;
//   }
// }

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from './../../../libs/common/guards/jwt-auth.guard';

@Injectable()
export class SilentJwtAuthGuard extends JwtAuthGuard {
  override handleRequest<TUser = any>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const url = typeof req.url === 'string' ? req.url : '';

    // 👇 No logout, permite user null
    if (url.includes('/logout')) {
      return (user ?? null) as TUser;
    }

    // comportamento padrão
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }

    return user;
  }
}
