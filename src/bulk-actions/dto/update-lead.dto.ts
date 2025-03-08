import { IsString, IsOptional, Validate, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AtLeastOneField } from '../../common/decorators/at-least-one-field.decorator';
import { IsObjectIdOrUint8ArrayOrInteger } from 'src/validators/is-valid-id.validator';

export class LeadDto {
  @ApiProperty({ description: 'The unique ID of the lead', required: true })
  @IsNotEmpty()
  @IsObjectIdOrUint8ArrayOrInteger()
  _id: string;

  @ApiPropertyOptional({ description: 'The name of the lead', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'The email of the lead',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @Validate(AtLeastOneField, ['name', 'email'], {
    message: 'At least one of name or email must be provided',
  })
  atLeastOneField: string;
}
