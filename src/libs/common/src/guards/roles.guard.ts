import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../interface';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      this.logger.debug('Nenhuma role definida, acesso permitido.');
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    this.logger.debug(`Usuário autenticado: ${JSON.stringify(user)}`);
    this.logger.debug(`Roles exigidas: ${roles.join(', ')}`);

    if (user && user.role === 'ADMIN') {
      this.logger.debug('Usuário é ADMIN, acesso permitido.');
      return true;
    }

    if (!user || !roles.includes(user.role)) {
      this.logger.warn('Usuário não autorizado tentou acessar a rota.');
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
