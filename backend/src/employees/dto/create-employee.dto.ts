import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { EmployeeStatus } from '@prisma/client';

export class CreateEmployeeDto {
  @IsInt({ message: 'El ID de campaña es obligatorio.' })
  campaignId: number;

  @IsString({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(180, { message: 'El nombre no puede superar 180 caracteres.' })
  fullName: string;

  @IsString({ message: 'El documento es obligatorio.' })
  @MinLength(1, { message: 'El documento es obligatorio.' })
  @MaxLength(50, { message: 'El documento no puede superar 50 caracteres.' })
  documentId: string;

  @IsOptional()
  @IsEmail({}, { message: 'Formato de correo inválido.' })
  @MaxLength(180, { message: 'El correo no puede superar 180 caracteres.' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'El teléfono no puede superar 30 caracteres.' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'La dirección no puede superar 255 caracteres.' })
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La ciudad no puede superar 100 caracteres.' })
  shippingCity?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus, {
    message: 'Estado inválido. Usa: PENDING, IN_PROGRESS, CONFIRMED o BLOCKED.',
  })
  status?: EmployeeStatus;
}
