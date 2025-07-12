import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from './../../../libs/common/dto/user';
import type { Request } from 'express-serve-static-core';
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (
      !requiredRoles.some((role) => {
        if (typeof user.role === 'string') {
          return role.toLowerCase() === user.role.toLowerCase();
        }
        return false;
      })
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
