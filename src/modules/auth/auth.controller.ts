import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../../libs/common';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import {
  User,
  CreateUserDTO,
  ForgotPasswordDTO,
} from './../../libs/common/dto/user';
import { JwtPayload } from './dto/jwt-payload.dto';

interface AuthenticatedRequest extends Request {
  user: User;
}

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

  @Get('validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  validate(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Session not valid');
    }
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'USER')
  async logout(@Req() req: Request & { user?: JwtPayload }) {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }
    const userId = Number(req.user.sub);
    await this.authService.signOut(userId);
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
