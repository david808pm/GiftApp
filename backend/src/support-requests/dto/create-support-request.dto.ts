import { IsString, IsOptional, IsInt, IsEnum, MinLength, MaxLength } from 'class-validator';
import { SupportType } from '@prisma/client';

export class CreateSupportRequestDto {
  @IsOptional()
  @IsInt({ message: 'El ID de campaña debe ser un número entero.' })
  campaignId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El documento no puede superar 50 caracteres.' })
  documentId?: string;

  @IsEnum(SupportType, {
    message:
      'Tipo de soporte inválido. Usa: NOT_FOUND, BENEFICIARY_DATA_INCORRECT, MISSING_BENEFICIARY, AGE_GENDER_INCORRECT, GIFT_SELECTION_PROBLEM, OTHER.',
  })
  type: SupportType;

  @IsString({ message: 'El mensaje es obligatorio.' })
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres.' })
  @MaxLength(1000, { message: 'El mensaje no puede superar 1000 caracteres.' })
  message: string;
}
