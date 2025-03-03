import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDTO,
  ForgotPasswordDTO,
  RefreshTokenDTO,
} from '../../../libs/common/src';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUser: CreateUserDTO) {
    return this.authService.register(registerUser);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') pass: string) {
    return this.authService.signIn(email, pass);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDTO) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
