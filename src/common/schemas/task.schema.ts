import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  version: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
