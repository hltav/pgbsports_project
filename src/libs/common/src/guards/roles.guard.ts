// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Roles } from '../decorator/roles.decorator';
// import { User } from '../interface/user.interface';
// import { Request } from 'express';

// declare module 'express' {
//   interface Request {
//     user?: User; // Adicione a propriedade user com o tipo User
//   }
// }

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const roles = this.reflector.get<string[]>(Roles, context.getHandler());
//     if (!roles) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest<Request>();
//     const user = request.user; // Asserção de tipo

//     if (!user || !roles.includes(user.role)) {
//       throw new ForbiddenException(
//         'You do not have permission to access this resource',
//       );
//     }

//     return true;
//   }
// }

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator/roles.decorator';
import { User } from '../interface/user.interface';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: User; // Adicione a propriedade user com o tipo User
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>(Roles, context.getHandler());
    if (!roles) {
      return true; // Se não houver roles definidas, permite o acesso
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user; // Obtém o usuário autenticado

    // Se o usuário for Admin, permite o acesso
    if (user && user.role === 'ADMIN') {
      return true;
    }

    // Caso contrário, verifica se o usuário tem uma das roles exigidas
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
