import { Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Request } from './../../../libs/common/interface/request.interface';

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

  private getCookieOptions(req?: Request) {
    const isProduction = process.env.NODE_ENV === 'production';
    const requestOrigin = req?.headers?.origin;
    const isHttpsFrontend = !!requestOrigin?.startsWith('https://');

    // Se frontend é https (mesmo em dev) ou prod => precisa SameSite=None + Secure
    if (isHttpsFrontend || isProduction) {
      return {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        // Em prod você quer domain real; em dev pode ser localhost (ou nem setar domain)
        domain: isProduction ? this.cookieDomain : 'localhost',
      };
    }

    // Dev http padrão
    return {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      // sem domain em dev http (melhor)
    };
  }

  setAuthCookies(reply: FastifyReply, tokens: AuthTokens, req?: Request) {
    const opts = this.getCookieOptions(req);

    reply.setCookie('access_token', tokens.accessToken, {
      ...opts,
      maxAge: 15 * 60 * 1000, // 15 min em ms
    });

    reply.setCookie('refresh_token', tokens.refreshToken, {
      ...opts,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
    });
  }

  clearAuthCookies(reply: FastifyReply, req?: Request) {
    const opts = this.getCookieOptions(req);

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
