import { Injectable } from '@nestjs/common';
import { CreateUserDTO, ForgotPasswordDTO } from './../../libs';
import { ForgotPasswordService } from './services/forgot-password.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { RegisterUserService } from './services/register-user.service';
import { SignInService } from './services/sign-in.service';
import { SignOutService } from './services/sign-out.service';

@Injectable()
export class AuthService {
  constructor(
    private registerUserService: RegisterUserService,
    private signInService: SignInService,
    private signOutService: SignOutService,
    private forgotPasswordService: ForgotPasswordService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  register(dto: CreateUserDTO) {
    return this.registerUserService.execute(dto);
  }

  signIn(email: string, password: string) {
    return this.signInService.execute(email, password);
  }

  signOut(userId: number) {
    return this.signOutService.execute(userId);
  }

  forgotPassword(dto: ForgotPasswordDTO) {
    return this.forgotPasswordService.execute(dto);
  }

  refreshToken(token: string) {
    return this.refreshTokenService.execute(token);
  }
}
