// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Logger,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { Request } from './../../../libs/common/interface/request.interface';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   private readonly logger = new Logger(RolesGuard.name);

//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.get<string[]>(
//       'roles',
//       context.getHandler(),
//     );
//     if (!requiredRoles) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest<Request>();
//     const user = request.user;

//     if (
//       !user ||
//       !requiredRoles.some(
//         (role) => role.toLowerCase() === (user.role as string).toLowerCase(),
//       )
//     ) {
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
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Request } from './../../../libs/common/interface/request.interface';
import { roleHierarchy } from './../../../libs/utils/roleHierarchy';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = Math.max(
      ...requiredRoles.map((role) => roleHierarchy[role]),
    );

    if (userLevel < requiredLevel) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
