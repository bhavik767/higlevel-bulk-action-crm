import {
  IsString,
  IsEmail,
  IsOptional,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AtLeastOneField } from '../../common/decorators/at-least-one-field.decorator';
import { IsObjectIdOrUint8ArrayOrInteger } from '../../validators/is-valid-id.validator';

export class ContactDto {
  @ApiProperty({ description: 'The unique ID of the contact' })
  @IsNotEmpty()
  @IsObjectIdOrUint8ArrayOrInteger()
  _id: string;

  @ApiPropertyOptional({ description: 'The name of the contact' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The email of the contact' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'The phone number of the contact' })
  @IsOptional()
  @IsString()
  phone?: string;

  @Validate(AtLeastOneField, ['name', 'email', 'phone'], {
    message: 'At least one of name, email, or phone must be provided',
  })
  atLeastOneField: string;
}
