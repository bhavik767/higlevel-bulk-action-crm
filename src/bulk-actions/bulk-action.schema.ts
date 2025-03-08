import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class BulkAction extends Document {
  @Prop()
  accountId: string;

  @Prop()
  entityType: string;

  @Prop({ type: Array, of: Object, default: [] })
  entitiesToUpdate: any[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 'queued' })
  status: string;

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: 0 })
  failureCount: number;

  @Prop({ default: 0 })
  skippedCount: number;

  @Prop({ type: [String], default: [] })
  actionErrors: string[];

  @Prop({ default: null })
  scheduledFor: Date | null;

  @Prop({ default: 0 })
  sequenceNumber: number;
}

export const BulkActionSchema = SchemaFactory.createForClass(BulkAction);
