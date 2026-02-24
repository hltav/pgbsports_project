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
import { Roles, RolesGuard } from '../../libs/common';
import {
  User,
  CreateUserDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from './../../libs/common/dto/user';
import { JwtPayload } from './dto/jwt-payload.dto';
import { FastifyReply } from 'fastify';
import { SilentJwtAuthGuard } from './guards/silentJwtAuthGuard.guard';
import { Request } from './../../libs/common/interface/request.interface';
import { AuthCookieService } from './services/authCookies.service';
import { Role } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  private cookieDomain: string;
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {
    this.cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
  }

  @Post('register')
  async register(@Body() registerUser: CreateUserDTO) {
    return this.authService.register(registerUser);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') pass: string,
    @Req() req: Request,
    @Res() res: FastifyReply,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.signIn(
      email,
      pass,
    );

    this.authCookieService.setAuthCookies(res, { accessToken, refreshToken });

    return res.send({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  }

  @Get('me')
  async me(@Req() req: Request, @Res() res: FastifyReply) {
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
  @UseGuards(SilentJwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT, Role.TEST_USER, Role.USER)
  validate(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Session not valid');
    }
    return req.user;
  }

  @Post('logout')
  @UseGuards(SilentJwtAuthGuard)
  async logout(
    @Req() req: Request & { user?: JwtPayload },
    @Res() reply: FastifyReply,
  ) {
    if (!req.user) {
      this.authCookieService.clearAuthCookies(reply);
      return reply.send({ message: 'Cookies cleared' });
    }

    const userId = Number(req.user.sub);
    const currentUser = req.user;

    await this.authService.signOut(userId, {
      id: currentUser.id,
      role: currentUser.role,
    });

    this.authCookieService.clearAuthCookies(reply);

    return reply.send({ message: 'Logged out successfully' });
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
  async refresh(@Req() req: Request, @Res() res: FastifyReply) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      this.authCookieService.clearAuthCookies(res);
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      this.authCookieService.setAuthCookies(res, {
        accessToken,
        refreshToken: newRefreshToken,
      });

      return res.send({ message: 'Token renovado com sucesso' });
    } catch {
      this.authCookieService.clearAuthCookies(res);
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
