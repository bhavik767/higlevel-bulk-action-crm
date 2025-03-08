import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { LogService } from 'src/logger/log.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private redisClient: Redis;
  private maxLimit: number;
  private time: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly logger: LogService,
  ) {
    this.redisClient = this.redisService.getClient();
    this.maxLimit = this.configService.get<number>(
      'RATE_LIMIT_MAX_REQUESTS',
      10000,
    );
    this.time = this.configService.get<number>('RATE_LIMIT_TIME', 60);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Missing accountId in request body',
      });
    }

    try {
      const rateLimitKey = `rate-limit:${accountId}`;
      const currentCount = await this.redisClient.incr(rateLimitKey);

      if (currentCount > this.maxLimit) {
        await this.redisClient.expire(rateLimitKey, this.time); // Reset count after specified time
        return res.status(429).json({
          success: false,
          message: `Rate limit exceeded! Please wait for at least ${this.time} seconds!`,
        });
      }
    } catch (error) {
      this.logger.error(`Rate limit middleware error: ${error}`);
    }

    return next();
  }
}
