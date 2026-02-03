import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse<FastifyReply>();

        this.metricsService.recordRequest({
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          duration,
          timestamp: new Date(),
        });
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - startTime;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        this.metricsService.recordRequest({
          method: request.method,
          path: request.url,
          statusCode,
          duration,
          timestamp: new Date(),
        });

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.metricsService.recordError({
          message: errorMessage,
          stack: errorStack,
          path: request.url,
          timestamp: new Date(),
        });

        return throwError(() => error);
      }),
    );
  }
}
