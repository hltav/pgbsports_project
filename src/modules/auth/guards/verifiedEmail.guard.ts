import { User } from './../../../libs/common/dto/user';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from '@nestjs/common';
;

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User;

    if (!user?.emailVerification?.verified) {
      throw new ForbiddenException(
        'Confirme seu e-mail para acessar essa funcionalidade.',
      );
    }

    return true;
  }
}
