import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../../libs/common';
import {
  User,
  CreateUserDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from './../../libs/common/dto/user';
import { JwtPayload } from './dto/jwt-payload.dto';
import { FastifyReply, FastifyRequest } from 'fastify';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUser: CreateUserDTO) {
    return this.authService.register(registerUser);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') pass: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.signIn(
      email,
      pass,
    );

    res.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'none',
      path: '/',
      maxAge: 60 * 15, // 15 minutos
    });

    res.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'none',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias,
    });

    return res.send({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  }

  @Get('me')
  async me(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    try {
      const userData = await this.authService.signInVerify(accessToken);
      return res.send(userData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new UnauthorizedException(
        'Token inválido ou expirado',
        errorMessage,
      );
    }
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

  @Post('confirm-email')
  async confirmEmail(@Body('token') token: string) {
    await this.authService.confirmeEmail(token);
    return { success: true, message: 'E-mail confirmado com sucesso!' };
  }

  @Post('resend-confirmation')
  async resendConfirmation(@Body('email') email: string) {
    await this.authService.resendConfirmeEmail(email);
    return { message: 'Novo link de confirmação enviado com sucesso.' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDTO) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return {
      message: 'Se o e-mail existir, um link de redefinição será enviado.',
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh')
  async refresh(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(refresh_token);

    res.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'none',
      path: '/',
      maxAge: 60 * 15,
    });

    res.setCookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'none',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res.send({ message: 'Token renovado com sucesso' });
  }
}
