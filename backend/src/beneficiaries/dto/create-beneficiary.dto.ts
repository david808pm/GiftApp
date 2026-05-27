import {
  IsString,
  IsInt,
  IsEnum,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateBeneficiaryDto {
  @IsInt({ message: 'El ID del empleado es obligatorio.' })
  employeeId: number;

  @IsString({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(180, { message: 'El nombre no puede superar 180 caracteres.' })
  fullName: string;

  @IsInt({ message: 'La edad debe ser un número entero.' })
  @Min(0, { message: 'La edad mínima es 0.' })
  @Max(13, { message: 'La edad máxima es 13.' })
  age: number;

  @IsEnum(Gender, { message: 'Género inválido. Usa: male o female.' })
  gender: Gender;
}
