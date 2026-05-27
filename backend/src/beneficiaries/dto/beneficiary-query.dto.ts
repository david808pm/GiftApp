import { IsOptional, IsString, IsInt, IsEnum, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class BeneficiaryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'employeeId debe ser un número entero.' })
  employeeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'campaignId debe ser un número entero.' })
  campaignId?: number;

  @IsOptional()
  @IsEnum(Gender, { message: 'Filtro de género inválido.' })
  gender?: Gender;

  @IsOptional()
  @IsBooleanString()
  includeDeleted?: string;
}
