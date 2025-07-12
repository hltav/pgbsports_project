/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { JwtPayload } from '../auth/jwt-payload.interface';

declare module 'express' {
  interface Request {
    user?: JwtPayload;
  }
}
