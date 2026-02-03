import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class LoggingService implements LoggerService {
  log(message: string, context?: string) {
    console.log(
      `[${new Date().toISOString()}] [LOG] [${context || 'Application'}] ${message}`,
    );
  }

  error(message: string, trace?: string, context?: string) {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [${context || 'Application'}] ${message}`,
    );
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string, context?: string) {
    console.warn(
      `[${new Date().toISOString()}] [WARN] [${context || 'Application'}] ${message}`,
    );
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[${new Date().toISOString()}] [DEBUG] [${context || 'Application'}] ${message}`,
      );
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[${new Date().toISOString()}] [VERBOSE] [${context || 'Application'}] ${message}`,
      );
    }
  }
}
