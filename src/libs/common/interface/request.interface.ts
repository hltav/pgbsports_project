import { FastifyRequest } from 'fastify';
import { User } from '../dto';

export interface Request extends FastifyRequest {
  user: User;
}
