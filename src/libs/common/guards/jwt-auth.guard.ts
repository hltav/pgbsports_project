// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Request } from './../../../libs/common/interface/request.interface';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     try {
//       const isAuthorized = await super.canActivate(context);
//       if (!isAuthorized) {
//         return false;
//       }

//       const request = context.switchToHttp().getRequest<Request>();
//       const user = request.user;

//       if (user) {
//         user.role = user.role || 'USER';
//       }

//       return !!user;
//     } catch (error) {
//       console.error('JwtAuthGuard - Erro:', error);
//       throw error;
//     }
//   }
// }

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from './../../../libs/common/interface/request.interface';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // rota pública, liberar acesso sem autenticação
      return true;
    }

    try {
      const isAuthorized = await super.canActivate(context);
      if (!isAuthorized) {
        return false;
      }

      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user;

      if (user) {
        user.role = user.role || 'USER';
      }

      return !!user;
    } catch (error) {
      console.error('JwtAuthGuard - Erro:', error);
      throw error;
    }
  }
}
