import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Opportunity extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  version: number;
}

export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);
