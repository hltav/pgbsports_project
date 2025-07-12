import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from './../../../libs/common/dto/user';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isAuthorized = await super.canActivate(context);
      if (!isAuthorized) {
        return false;
      }

      const request = context.switchToHttp().getRequest<Request>();
      const user = request.user as User;

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
