import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch(UnauthorizedException, NotFoundException)
export class SilentExceptionFilter implements ExceptionFilter {
  catch(
    exception: UnauthorizedException | NotFoundException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    reply.status(exception.getStatus()).send({
      statusCode: exception.getStatus(),
      message: exception.message || 'Error',
    });
  }
}
