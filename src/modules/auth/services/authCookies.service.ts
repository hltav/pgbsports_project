import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthCookieService {
  private cookieDomain: string;

  constructor() {
    this.cookieDomain = process.env.COOKIE_DOMAIN || 'localhost';
  }

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      path: '/',
      httpOnly: true,
      secure: true, // você usa https
      sameSite: 'none' as const,
      ...(isProduction && { domain: this.cookieDomain }),
    };
  }

  setAuthCookies(reply: FastifyReply, tokens: AuthTokens) {
    const opts = this.getCookieOptions();

    reply.setCookie('access_token', tokens.accessToken, {
      ...opts,
      maxAge: 15 * 60 * 1000, // 15 min em ms
    });

    reply.setCookie('refresh_token', tokens.refreshToken, {
      ...opts,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
    });
  }

  clearAuthCookies(reply: FastifyReply) {
    const opts = this.getCookieOptions();

    reply.clearCookie('access_token', {
      ...opts,
      maxAge: 0,
      expires: new Date(0),
    });

    reply.clearCookie('refresh_token', {
      ...opts,
      maxAge: 0,
      expires: new Date(0),
    });
  }
}
