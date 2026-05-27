import { IsOptional, IsString, IsEnum, IsInt, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeStatus } from '@prisma/client';

export class EmployeeQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'campaignId debe ser un número entero.' })
  campaignId?: number;

  @IsOptional()
  @IsEnum(EmployeeStatus, {
    message: 'Filtro de estado inválido.',
  })
  status?: EmployeeStatus;

  @IsOptional()
  @IsBooleanString()
  includeDeleted?: string;
}
