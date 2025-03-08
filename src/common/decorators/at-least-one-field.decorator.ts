import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class AtLeastOneFieldValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyNames] = args.constraints;
    return relatedPropertyNames.some(
      (propertyName: string) => value[propertyName] !== undefined,
    );
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyNames] = args.constraints;
    return `At least one of the following fields must be provided: ${relatedPropertyNames.join(
      ', ',
    )}`;
  }
}

export function AtLeastOneField(
  propertyNames: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [propertyNames],
      validator: AtLeastOneFieldValidator,
    });
  };
}
