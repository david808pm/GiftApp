import { IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { SupportStatus } from '@prisma/client';

export class UpdateSupportRequestDto {
  @IsOptional()
  @IsEnum(SupportStatus, {
    message:
      'Estado inválido. Usa: OPEN, IN_REVIEW, RESOLVED, CLOSED, REJECTED.',
  })
  status?: SupportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La nota interna no puede superar 2000 caracteres.' })
  internalNote?: string;
}
