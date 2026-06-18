import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsBooleanString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SupportType, SupportStatus } from '@prisma/client';

export class SupportRequestQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  campaignId?: number;

  @IsOptional()
  @IsEnum(SupportStatus, {
    message: 'Filtro de estado inválido.',
  })
  status?: SupportStatus;

  @IsOptional()
  @IsEnum(SupportType, {
    message: 'Filtro de tipo inválido.',
  })
  type?: SupportType;

  @IsOptional()
  @IsBooleanString()
  verifiedEmployee?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
