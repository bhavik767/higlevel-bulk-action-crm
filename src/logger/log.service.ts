import { Injectable } from '@nestjs/common';
import { LogRepository } from './log.repository';
import { isNumber } from 'class-validator';

@Injectable()
export class LogService {
  constructor(private readonly logRepository: LogRepository) {}

  async log(message: any): Promise<void> {
    await this.saveLog('LOG', message);
  }

  async error(message: any): Promise<void> {
    await this.saveLog('ERROR', message);
  }

  async warn(message: any): Promise<void> {
    await this.saveLog('WARN', message);
  }

  private async saveLog(level: string, message: any): Promise<void> {
    if (typeof message === 'object') {
      const clonedObj = { ...message };
      if (message._id) {
        clonedObj._id = message?._id?.toHexString();
      }
      if (message.createdAt) {
        clonedObj.createdAt = message?.createdAt?.toISOString();
      }

      const jsonString = JSON.stringify(clonedObj);
      await this.logRepository.save({
        level,
        message: jsonString,
      });
    } else {
      await this.logRepository.save({ level, message });
    }
  }

  async getLogs(
    from?: Date,
    to?: Date,
    level?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any[]> {
    if (!isNumber(+page) || +page <= 0) {
      page = 1;
    }

    if (!isNumber(+limit) || +limit <= 0) {
      limit = 10;
    }

    let filters: any = {};

    // Construct filters object if any of the filters are provided
    if (from || to || level) {
      filters = {};
      if (from) filters.createdAt = { $gte: from };
      if (to) filters.createdAt = { ...filters.createdAt, $lte: to };
      if (level) filters.level = level;
    }

    return this.logRepository.getLogs(filters, page, limit);
  }

  async getAllLogs(page: number = 1, limit: number = 10): Promise<any[]> {
    if (!isNumber(+page) || +page <= 0) {
      page = 1;
    }

    if (!isNumber(+limit) || +limit <= 0) {
      limit = 10;
    }

    return this.logRepository.getAllLogs(page, limit);
  }

  async clearLogs(): Promise<void> {
    await this.logRepository.clearLogs();
  }
}
