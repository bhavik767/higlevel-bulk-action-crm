import { IsString, IsOptional, Validate, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AtLeastOneField } from '../../common/decorators/at-least-one-field.decorator';
import { IsObjectIdOrUint8ArrayOrInteger } from 'src/validators/is-valid-id.validator';

export class OpportunityDto {
  @ApiProperty({
    description: 'The unique ID of the opportunity',
    required: true,
  })
  @IsNotEmpty()
  @IsObjectIdOrUint8ArrayOrInteger()
  _id: string;

  @ApiPropertyOptional({
    description: 'The name of the opportunity',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'The email of the opportunity',
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
