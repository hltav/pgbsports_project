// import { Injectable, NestMiddleware } from '@nestjs/common';

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: Function) {
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//     next();
//   }
// }

//   //app.module.ts;

// import { LoggerMiddleware } from './common/middlewares/logger.middleware';

// @Module({})
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(LoggerMiddleware).forRoutes('*');
//   }
// }
