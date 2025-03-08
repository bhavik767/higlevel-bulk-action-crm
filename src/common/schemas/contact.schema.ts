import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Contact extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: 0 })
  version: number;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
