import { IsString, IsOptional, Validate, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AtLeastOneField } from '../../common/decorators/at-least-one-field.decorator';
import { IsObjectIdOrUint8ArrayOrInteger } from 'src/validators/is-valid-id.validator';

export class TaskDto {
  @ApiProperty({ description: 'The unique ID of the task', required: true })
  @IsNotEmpty()
  @IsObjectIdOrUint8ArrayOrInteger()
  _id: string;

  @ApiPropertyOptional({
    description: 'The title of the task',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'The description of the task',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @Validate(AtLeastOneField, ['title', 'description'], {
    message: 'At least one of title or description must be provided',
  })
  atLeastOneField: string;
}
