import { Controller, Get, Query, ParseIntPipe, Delete } from '@nestjs/common';
import { LogService } from './log.service';
import { ApiTags, ApiQuery, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('Logger')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve logs with optional filters' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    description: 'Start date for log retrieval',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    description: 'End date for log retrieval',
  })
  @ApiQuery({
    name: 'level',
    required: false,
    type: String,
    description: 'Log level to filter by',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of logs per page',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  async getLogs(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('level') level?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      fromDate = new Date(from);
    }
    if (to) {
      toDate = new Date(to);
    }

    // Call the service method based on provided filters
    if (fromDate || toDate || level) {
      return this.logService.getLogs(fromDate, toDate, level, page, limit);
    } else {
      return this.logService.getAllLogs(page, limit);
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all logs' })
  @ApiResponse({ status: 200, description: 'Logs deleted successfully' })
  async deleteLogs() {
    await this.logService.clearLogs();
    return { message: 'Logs deleted successfully' };
  }
}
