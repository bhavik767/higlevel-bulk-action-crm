import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from './log.schema';

@Injectable()
export class LogRepository {
  constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}

  async save(log: Log): Promise<Log> {
    const createdLog = new this.logModel(log);
    return createdLog.save();
  }

  async getLogs(
    filters: any = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<Log[]> {
    const query = this.logModel.find(filters);
    query.skip((page - 1) * limit).limit(limit);
    return query.exec();
  }

  async getAllLogs(page: number = 1, limit: number = 10): Promise<Log[]> {
    const query = this.logModel.find();
    query.skip((page - 1) * limit).limit(limit);
    return query.exec();
  }

  async clearLogs(): Promise<void> {
    await this.logModel.deleteMany({}).exec();
  }
}
