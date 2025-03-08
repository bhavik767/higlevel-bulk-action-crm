import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsObjectIdOrUint8ArrayOrIntegerConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    if (typeof value === 'string' && /^[a-f0-9]{24}$/.test(value)) {
      return true;
    }
    if (value instanceof Uint8Array && value.length === 12) {
      return true;
    }
    if (Number.isInteger(value)) {
      return true;
    }
    return false;
  }

  defaultMessage(): string {
    return 'Either _id field missing or is in invalid format';
  }
}

export function IsObjectIdOrUint8ArrayOrInteger(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsObjectIdOrUint8ArrayOrIntegerConstraint,
    });
  };
}
