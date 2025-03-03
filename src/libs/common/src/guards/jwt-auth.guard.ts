import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthorized = await super.canActivate(context);
    if (!isAuthorized) {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    // Aqui, adicione a lógica para garantir que o usuário tenha a propriedade role
    if (user) {
      user.role = user.role || 'USER'; // Defina um valor padrão se a role não estiver definida
    }

    return !!user;
  }
}
