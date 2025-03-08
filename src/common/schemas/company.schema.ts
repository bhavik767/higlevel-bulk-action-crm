import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Company extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  industry?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  version: number;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
