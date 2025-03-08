import { IsString, IsOptional, Validate, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AtLeastOneField } from '../../common/decorators/at-least-one-field.decorator';
import { IsObjectIdOrUint8ArrayOrInteger } from 'src/validators/is-valid-id.validator';

export class CompanyDto {
  @ApiProperty({ description: 'The unique ID of the company' })
  @IsNotEmpty()
  @IsObjectIdOrUint8ArrayOrInteger()
  _id: string;

  @ApiPropertyOptional({ description: 'The name of the company' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The industry of the company' })
  @IsOptional()
  @IsString()
  industry?: string;

  @Validate(AtLeastOneField, ['name', 'industry'], {
    message: 'At least one of name or industry must be provided',
  })
  atLeastOneField: string;
}
