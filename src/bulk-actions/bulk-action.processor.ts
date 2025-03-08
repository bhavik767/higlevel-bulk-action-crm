import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BulkAction } from './bulk-action.schema';
import { BulkActionService } from './bulk-action.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongodb';
import {
  ACTION_STATUS_MAPPING,
  ENTITY_COLLECTION_NAME,
} from './constants/bulk-action.constant';
import { LogService } from 'src/logger/log.service';

@Processor('bulk-action-queue')
export class BulkActionProcessor {
  private redisClient: Redis;
  private batchSize: number;

  constructor(
    @InjectModel(BulkAction.name)
    private readonly bulkActionModel: Model<BulkAction>,
    private readonly bulkActionService: BulkActionService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly logger: LogService,
  ) {
    this.redisClient = this.redisService.getClient();
    this.batchSize = this.configService.get<number>('BATCH_SIZE', 50);
  }

  @Process('processBulkAction')
  async handleProcessBulkAction(job: Job<{ bulkActionId: string }>) {
    const { bulkActionId } = job.data;

    const bulkAction = await this.bulkActionModel.findById(bulkActionId);
    if (!bulkAction) {
      this.logger.warn(`Bulk action ${bulkActionId} not found`);
      return;
    }

    const { entityType, entitiesToUpdate: entities } = bulkAction;
    const totalEntities = entities.length;
    const bulkActionStatusKey = `bulk-action-status:${bulkActionId}`;

    let { bulkActionStatus, successCount, failureCount, skippedCount, errors } =
      await this.initializeCounters(bulkActionStatusKey);

    await this.bulkActionService.updateBulkActionStatus(
      bulkActionId,
      { status: 'processing', successCount, failureCount, skippedCount },
      errors,
    );

    const alreadyProcessedEntities = Object.keys(bulkActionStatus);
    for (let i = 0; i < totalEntities; i += this.batchSize) {
      const batch = entities.slice(i, i + this.batchSize);
      await this.processBatch(
        batch,
        entityType,
        bulkActionStatusKey,
        alreadyProcessedEntities,
      );

      const updatedCounts = await this.updateCounts(bulkActionStatusKey);
      successCount = updatedCounts.successCount;
      failureCount = updatedCounts.failureCount;
      skippedCount = updatedCounts.skippedCount;
      errors = updatedCounts.errors;

      await this.bulkActionService.updateBulkActionStatus(
        bulkActionId,
        { successCount, failureCount, skippedCount },
        errors,
      );
    }

    await this.bulkActionService.updateBulkActionStatus(bulkActionId, {
      status: 'completed',
    });

    // Remove the data for this key from Redis once bulk-updte is completely done
    await this.redisClient.del(bulkActionStatusKey);
  }

  private async initializeCounters(bulkActionStatusKey: string) {
    const bulkActionStatus =
      await this.redisClient.hgetall(bulkActionStatusKey);
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    let errors = [];

    Object.values(bulkActionStatus).forEach((entity) => {
      const { status, entityId, message } = JSON.parse(entity);
      switch (status) {
        case ACTION_STATUS_MAPPING.SUCCESS:
          successCount++;
          break;
        case ACTION_STATUS_MAPPING.FAILURE:
          failureCount++;
          errors.push(JSON.stringify({ entityId, message }));
          break;
        case ACTION_STATUS_MAPPING.SKIPPED:
          skippedCount++;
          errors.push(JSON.stringify({ entityId, message }));
          break;
      }
    });

    return {
      bulkActionStatus,
      successCount,
      failureCount,
      skippedCount,
      errors,
    };
  }

  private async processBatch(
    batch,
    entityType,
    bulkActionStatusKey,
    alreadyProcessedEntities,
  ) {
    await Promise.all(
      batch.map(async (entity) => {
        if (
          await this.isAlreadyProcessed(entity._id, alreadyProcessedEntities)
        ) {
          this.logger.log({
            message: 'Skipping this entity',
            entityId: entity._id,
          });
          return;
        }

        try {
          if (
            entity.email &&
            (await this.isDuplicate(entityType, entity.email))
          ) {
            await this.updateRedisStatus(
              bulkActionStatusKey,
              entity._id,
              ACTION_STATUS_MAPPING.SKIPPED,
              'Duplicate Email',
            );
            return;
          }

          const updateResult = await this.updateEntity(entity, entityType);

          if (updateResult.modifiedCount > 0) {
            await this.updateRedisStatus(
              bulkActionStatusKey,
              entity._id,
              ACTION_STATUS_MAPPING.SUCCESS,
            );
          } else {
            const entityId = new ObjectId(String(entity._id));

            const data = await this.doesDocumentExist(entityType, entityId);
            if (!data) {
              await this.updateRedisStatus(
                bulkActionStatusKey,
                entity._id,
                ACTION_STATUS_MAPPING.FAILURE,
                "Entity doesn't exists",
              );
            } else {
              await this.updateRedisStatus(
                bulkActionStatusKey,
                entity._id,
                ACTION_STATUS_MAPPING.SKIPPED,
                'Version mismatch',
              );
            }
          }
        } catch (error) {
          await this.updateRedisStatus(
            bulkActionStatusKey,
            entity._id,
            ACTION_STATUS_MAPPING.FAILURE,
            error.message,
          );
        }
      }),
    );
  }

  private async updateEntity(entity, entityType) {
    const entityName = this.getCollectionName(entityType);
    const collection = this.bulkActionModel.db.collection(entityName);

    const entityId = new ObjectId(String(entity._id));

    delete entity._id;

    const result = await collection.updateOne(
      { _id: entityId, version: entity.version },
      { $set: { ...entity, version: entity.version + 1 } },
      { upsert: false },
    );

    entity._id = entityId;
    return result;
  }

  private async updateRedisStatus(
    key: string,
    entityId: string,
    status: number,
    message: string = null,
  ) {
    await this.redisClient.hsetnx(
      key,
      entityId,
      JSON.stringify({ status, entityId, message }),
    );
  }

  private async updateCounts(bulkActionStatusKey: string) {
    const bulkActionStatus =
      await this.redisClient.hgetall(bulkActionStatusKey);
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    let errors = [];

    Object.values(bulkActionStatus).forEach((entity) => {
      const { status, entityId, message } = JSON.parse(entity);
      switch (status) {
        case ACTION_STATUS_MAPPING.SUCCESS:
          successCount++;
          break;
        case ACTION_STATUS_MAPPING.FAILURE:
          failureCount++;
          errors.push(JSON.stringify({ entityId, message }));
          break;
        case ACTION_STATUS_MAPPING.SKIPPED:
          skippedCount++;
          errors.push(JSON.stringify({ entityId, message }));
          break;
      }
    });

    return { successCount, failureCount, skippedCount, errors };
  }

  private async isAlreadyProcessed(
    entityId: string,
    alreadyProcessedEntities: string[],
  ) {
    return alreadyProcessedEntities.includes(entityId);
  }

  private async isDuplicate(entityType: any, email: string) {
    return (
      (await this.bulkActionModel.db
        .collection(this.getCollectionName(entityType))
        .findOne({ email: email })) !== null
    );
  }

  private async doesDocumentExist(entityType: string, entityId) {
    return (
      (await this.bulkActionModel.db
        .collection(this.getCollectionName(entityType))
        .findOne({ _id: entityId })) !== null
    );
  }

  private getCollectionName(entityType: string) {
    return ENTITY_COLLECTION_NAME[entityType];
  }
}
