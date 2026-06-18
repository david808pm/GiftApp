import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsBooleanString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GiftAllowedGender, GiftStatus } from '@prisma/client';

export class GiftQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'campaignId debe ser un número entero.' })
  campaignId?: number;

  @IsOptional()
  @IsEnum(GiftStatus, {
    message: 'Filtro de estado inválido.',
  })
  status?: GiftStatus;

  @IsOptional()
  @IsEnum(GiftAllowedGender, {
    message: 'Filtro de género inválido.',
  })
  allowedGender?: GiftAllowedGender;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(13)
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(13)
  maxAge?: number;

  @IsOptional()
  @IsBooleanString()
  includeDeleted?: string;
}
