import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from './../../../libs/common/interface/request.interface';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user?.emailVerification?.verified) {
      throw new ForbiddenException(
        'Confirme seu e-mail para acessar essa funcionalidade.',
      );
    }

    return true;
  }
}
