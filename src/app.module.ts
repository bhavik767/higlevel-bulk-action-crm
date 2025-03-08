import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BulkActionModule } from './bulk-actions/bulk-action.module';
import { RateLimitMiddleware } from './middlewares/rate-limit.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './logger/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        config: {
          url: configService.get<string>('REDIS_URL'),
        },
      }),
      inject: [ConfigService],
    }),
    BulkActionModule,
    LoggerModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');

    consumer
      .apply(RateLimitMiddleware)
      .forRoutes({ path: 'bulk-actions', method: RequestMethod.POST });
  }
}
