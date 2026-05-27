import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GiftAllowedGender, GiftStatus } from '@prisma/client';

export class CreateGiftDto {
  @IsInt({ message: 'El ID de campaña es obligatorio.' })
  campaignId: number;

  @IsString({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(180, { message: 'El nombre no puede superar 180 caracteres.' })
  name: string;

  @IsString({ message: 'La referencia es obligatoria.' })
  @MinLength(2, { message: 'La referencia debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'La referencia no puede superar 50 caracteres.' })
  reference: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción corta no puede superar 500 caracteres.' })
  shortDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La descripción técnica no puede superar 2000 caracteres.' })
  technicalDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Las dimensiones no pueden superar 100 caracteres.' })
  dimensions?: string;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock?: number;

  @IsOptional()
  @IsInt({ message: 'La edad mínima debe ser un número entero.' })
  @Min(0, { message: 'La edad mínima no puede ser negativa.' })
  @Max(13, { message: 'La edad mínima no puede superar 13.' })
  minAge?: number;

  @IsOptional()
  @IsInt({ message: 'La edad máxima debe ser un número entero.' })
  @Min(0, { message: 'La edad máxima no puede ser negativa.' })
  @Max(13, { message: 'La edad máxima no puede superar 13.' })
  maxAge?: number;

  @IsOptional()
  @IsEnum(GiftAllowedGender, {
    message: 'Género permitido inválido. Usa: all, male o female.',
  })
  allowedGender?: GiftAllowedGender;

  @IsOptional()
  @IsEnum(GiftStatus, {
    message: 'Estado inválido. Usa: ACTIVE o INACTIVE.',
  })
  status?: GiftStatus;

  @IsOptional()
  @IsArray({ message: 'imageUrls debe ser un array de strings.' })
  @IsString({ each: true, message: 'Cada URL debe ser un string.' })
  imageUrls?: string[];
}
