import { Injectable } from '@nestjs/common';
import {
  CreateUserDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from './../../libs';
import { ForgotPasswordService } from './services/forgotPassword.service';
import { RefreshTokenService } from './services/refreshToken.service';
import { RegisterUserService } from './services/registerUser.service';
import { SignInService } from './services/signIn.service';
import { SignOutService } from './services/signOut.service';
import { SignInVerifyService } from './services/signInVerify.service';
import { ConfirmEmailService, ResetPasswordService } from './services';

@Injectable()
export class AuthService {
  constructor(
    private registerUserService: RegisterUserService,
    private signInService: SignInService,
    private signInServiceVerify: SignInVerifyService,
    private signOutService: SignOutService,
    private forgotPasswordService: ForgotPasswordService,
    private refreshTokenService: RefreshTokenService,
    private resetPasswordService: ResetPasswordService,
    private confirmEmail: ConfirmEmailService,
  ) {}

  register(dto: CreateUserDTO) {
    return this.registerUserService.execute(dto);
  }

  signIn(email: string, password: string) {
    return this.signInService.execute(email, password);
  }

  signInVerify(email: string) {
    return this.signInServiceVerify.execute(email);
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

  resetPassword(resetDto: ResetPasswordDTO) {
    return this.resetPasswordService.execute(resetDto);
  }

  confirmeEmail(token: string) {
    return this.confirmEmail.execute(token);
  }
}
