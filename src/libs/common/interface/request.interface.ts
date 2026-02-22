import { FastifyRequest } from 'fastify';
import { User } from '../dto';
import { Role } from '@prisma/client';

export interface Request extends FastifyRequest {
  user: User & { role: Role };
}
