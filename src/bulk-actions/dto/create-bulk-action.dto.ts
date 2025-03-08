import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsString,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';

import { ContactDto } from '../dto/update-contact.dto';
import { CompanyDto } from '../dto/update-company.dto';
import { LeadDto } from '../dto/update-lead.dto';
import { OpportunityDto } from '../dto/update-opportunity.dto';
import { TaskDto } from '../dto/update-task.dto';
import { EntityType } from '../constants/bulk-action.constant';
import { IsFutureUtcDateString } from 'src/validators/is-future-utc-date-string.validator';

export class CreateBulkActionDto {
  @ApiProperty({
    description: 'The unique ID of the account',
    type: String,
    required: true,
    example: '609f1521db8a54107c6b728c',
  })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    description: 'The type of entity to perform the bulk action on',
    enum: EntityType,
    required: true,
    example: EntityType.CONTACT,
  })
  @IsEnum(EntityType)
  entityType: EntityType;

  @ApiProperty({
    description: 'The list of entities to be updated',
    isArray: true,
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(ContactDto) },
        { $ref: getSchemaPath(CompanyDto) },
        { $ref: getSchemaPath(LeadDto) },
        { $ref: getSchemaPath(OpportunityDto) },
        { $ref: getSchemaPath(TaskDto) },
      ],
    },
    required: true,
    example: [
      {
        _id: '609f1521db8a54107c6b728c',
        name: 'John Doe',
        email: 'john@example.com',
      },
      {
        _id: '609f1521db8a54107c6b728d',
        name: 'Dr. Loren Cassin',
        email: 'Wade_McGlynn@example.com',
      },
    ],
  })
  @ValidateNested()
  @IsArray()
  @ArrayMinSize(1)
  @Type((o) => {
    const entityType = o.object.entityType;
    switch (entityType) {
      case EntityType.CONTACT:
        return ContactDto;
      case EntityType.COMPANY:
        return CompanyDto;
      case EntityType.LEAD:
        return LeadDto;
      case EntityType.OPPORTUNITY:
        return OpportunityDto;
      case EntityType.TASK:
        return TaskDto;
    }
  })
  entitiesToUpdate: Record<string, any>[];

  @ApiPropertyOptional({
    description:
      'The date and time when the bulk action should be executed, in the future',
    type: String,
    format: 'date-time',
    example: '2025-07-21T12:00:01.000Z',
  })
  @IsOptional()
  @IsFutureUtcDateString()
  scheduledFor?: Date;
}
