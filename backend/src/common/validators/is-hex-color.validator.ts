import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isHexColor', async: false })
export class IsHexColorConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return true; // optional field
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  }

  defaultMessage() {
    return 'El color debe ser un código hexadecimal válido (ej. #2563eb).';
  }
}

export function IsHexColor(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsHexColorConstraint,
    });
  };
}
