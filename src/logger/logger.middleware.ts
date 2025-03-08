import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { LogService } from './log.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LogService) {}

  use(req: Request, res: Response, next: () => void): void {
    const { method, url, baseUrl } = req;
    const start = Date.now();
    res.on('finish', () => {
      const end = Date.now();
      const duration = end - start;
      this.logger.log(
        `${method} ${baseUrl}${url} INFO ${res.statusCode} ${duration}ms`,
      );
    });
    next();
  }
}
