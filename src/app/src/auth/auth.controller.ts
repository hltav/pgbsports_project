import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDTO,
  ForgotPasswordDTO,
  JwtAuthGuard,
  JwtPayload,
  RefreshTokenDTO,
  Roles,
  RolesGuard,
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

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  async logout(@Req() req: Request & { user?: JwtPayload }) {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }

    await this.authService.signOut(Number(req.user.sub));
    return { message: 'Logged out successfully' };
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
