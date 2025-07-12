/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '../../libs/common/dto/user';
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
