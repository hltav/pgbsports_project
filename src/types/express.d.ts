import { AuthenticatedUser } from '../schemas/auth/authenticated.user.schema';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
