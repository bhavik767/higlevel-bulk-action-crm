import { Module } from '@nestjs/common';
import { LogRepository } from './log.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './log.schema';
import { LogController } from './log.controller';
import { LogService } from './log.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }])],
  providers: [LogService, LogRepository],
  exports: [LogService],
  controllers: [LogController],
})
export class LoggerModule {}
