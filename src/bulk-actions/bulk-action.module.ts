import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { BulkActionService } from './bulk-action.service';
import { BulkActionController } from './bulk-action.controller';
import { BulkActionProcessor } from './bulk-action.processor';
import { BulkAction, BulkActionSchema } from './bulk-action.schema';
import { Contact, ContactSchema } from 'src/common/schemas/contact.schema';
import { Company, CompanySchema } from 'src/common/schemas/company.schema';
import { Lead, LeadSchema } from 'src/common/schemas/lead.schema';
import {
  Opportunity,
  OpportunitySchema,
} from 'src/common/schemas/opportunity.schema';
import { Task, TaskSchema } from 'src/common/schemas/task.schema';
import { LogService } from 'src/logger/log.service';
import { LoggerModule } from 'src/logger/logger.module';
import { LogRepository } from 'src/logger/log.repository';
import { Log, LogSchema } from 'src/logger/log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BulkAction.name, schema: BulkActionSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Opportunity.name, schema: OpportunitySchema },
      { name: Task.name, schema: TaskSchema },
      { name: Log.name, schema: LogSchema },
    ]),
    BullModule.registerQueue({
      name: 'bulk-action-queue',
    }),
    LoggerModule,
  ],
  providers: [
    BulkActionService,
    BulkActionProcessor,
    LogService,
    LogRepository,
  ],
  controllers: [BulkActionController],
})
export class BulkActionModule {}
