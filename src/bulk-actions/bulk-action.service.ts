import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { BulkAction } from './bulk-action.schema';
import { CreateBulkActionDto } from './dto/create-bulk-action.dto';
import { isNumber } from 'class-validator';
import { LogService } from 'src/logger/log.service';

@Injectable()
export class BulkActionService {
  constructor(
    @InjectModel(BulkAction.name)
    private readonly bulkActionModel: Model<BulkAction>,
    @InjectQueue('bulk-action-queue') private readonly bulkActionQueue: Queue,
    private readonly logger: LogService,
  ) {}

  async create(createBulkAction: CreateBulkActionDto): Promise<BulkAction> {
    const timestamp = new Date();
    const sequenceNumber = await this.getSequenceNumber(timestamp);

    const bulkAction = new this.bulkActionModel(createBulkAction);
    this.logger.log({ bulkAction });
    await bulkAction.save();

    if (bulkAction.scheduledFor) {
      // Schedule the job for the future
      await this.bulkActionQueue.add(
        'processBulkAction',
        { bulkActionId: bulkAction._id },
        {
          delay: bulkAction.scheduledFor.getTime() - Date.now(),
          removeOnComplete: true,
        },
      );
    } else {
      // Process immediately
      await this.bulkActionQueue.add(
        'processBulkAction',
        {
          bulkActionId: bulkAction._id,
        },
        {
          removeOnComplete: true,
          priority: -(timestamp.getTime() * 1000 + sequenceNumber),
        },
      );
    }

    return bulkAction;
  }

  async getBulkActions(page: number, limit: number) {
    if (!isNumber(+page) || +page <= 0) {
      page = 1;
    }

    if (!isNumber(+limit) || +limit <= 0) {
      limit = 10;
    }

    const actions = await this.bulkActionModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.bulkActionModel.countDocuments().exec();

    return {
      actions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBulkActionById(actionId: string) {
    // Check if the actionId is a valid ObjectId
    if (!Types.ObjectId.isValid(actionId)) {
      this.logger.warn({ message: 'Invalid action Id', actionId });
      return null;
    }

    return this.bulkActionModel.findById(actionId).exec();
  }

  async updateBulkActionStatus(
    actionId: string,
    fieldsToBeUpdated: Record<string, any>,
    errors = [],
  ) {
    return this.bulkActionModel
      .findByIdAndUpdate(actionId, {
        ...fieldsToBeUpdated,
        $push: { actionErrors: { $each: errors } },
      })
      .exec();
  }

  private async getSequenceNumber(timestamp: Date): Promise<number> {
    const count = await this.bulkActionModel
      .countDocuments({ createdAt: timestamp })
      .exec();
    return count + 1;
  }
}
