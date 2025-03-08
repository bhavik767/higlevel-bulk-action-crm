import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Lead extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  version: number;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
