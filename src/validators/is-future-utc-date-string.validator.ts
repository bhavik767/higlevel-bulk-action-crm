import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureUtcDateString', async: false })
export class IsFutureUtcDateStringConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any): boolean {
    // Check if value is a valid date string and if it is in the future and in UTC timezone
    const date = new Date(value);
    return (
      !isNaN(date.getTime()) &&
      date.toISOString() === value &&
      date.getTime() > Date.now()
    );
  }

  defaultMessage(): string {
    return 'scheduledFor must be a future date string in UTC timezone';
  }
}

export function IsFutureUtcDateString(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureUtcDateStringConstraint,
    });
  };
}
