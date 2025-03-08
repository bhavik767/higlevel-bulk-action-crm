import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BulkActionService } from './bulk-action.service';
import { CreateBulkActionDto } from './dto/create-bulk-action.dto';
import { BulkAction } from './bulk-action.schema';

@ApiTags('Bulk Actions')
@Controller('bulk-actions')
export class BulkActionController {
  constructor(private readonly bulkActionService: BulkActionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bulk action' })
  @ApiBody({ type: CreateBulkActionDto })
  @ApiResponse({
    status: 201,
    description: 'The bulk action has been successfully created.',
    type: BulkAction,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBulkAction(@Body() createBulkAction: CreateBulkActionDto) {
    return this.bulkActionService.create(createBulkAction);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of bulk actions' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of bulk actions',
    type: [BulkAction],
  })
  async getBulkActions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const response = await this.bulkActionService.getBulkActions(page, limit);
    const actions = response.actions.map((action) => {
      const {
        accountId,
        _id,
        entityType,
        status,
        successCount,
        failureCount,
        skippedCount,
        scheduledFor,
        createdAt,
      } = action;
      return {
        accountId,
        bulkActionId: _id,
        entityType,
        status,
        successCount,
        failureCount,
        skippedCount,
        scheduledFor,
        createdAt,
      };
    });

    return {
      success: true,
      data: {
        ...response,
        actions,
      },
    };
  }

  @Get(':actionId')
  @ApiOperation({ summary: 'Get details of a specific bulk action' })
  @ApiParam({
    name: 'actionId',
    required: true,
    description: 'ID of the bulk action',
  })
  @ApiResponse({
    status: 200,
    description: 'Details of the bulk action',
    type: BulkAction,
  })
  async getBulkActionById(@Param('actionId') actionId: string) {
    const result = await this.bulkActionService.getBulkActionById(actionId);

    return {
      success: result ? true : false,
      data: result || {},
    };
  }

  @Get(':actionId/stats')
  @ApiOperation({ summary: 'Get statistics of a specific bulk action' })
  @ApiParam({
    name: 'actionId',
    required: true,
    description: 'ID of the bulk action',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics of the bulk action',
    schema: {
      type: 'object',
      properties: {
        successCount: { type: 'number' },
        failureCount: { type: 'number' },
        skippedCount: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async getBulkActionStats(@Param('actionId') actionId: string) {
    const action = await this.bulkActionService.getBulkActionById(actionId);
    if (action) {
      return {
        success: true,
        data: {
          actionId: action._id,
          successCount: action.successCount,
          failureCount: action.failureCount,
          skippedCount: action.skippedCount,
          errors: action.actionErrors,
          createdAt: action.createdAt,
        },
      };
    } else {
      return {
        success: false,
        data: {},
      };
    }
  }
}
