import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { CampaignStatus } from '@prisma/client';

export class QueryCampaignsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CampaignStatus, {
    message: 'Filtro de estado inválido.',
  })
  status?: CampaignStatus;

  @IsOptional()
  @IsBooleanString()
  includeDeleted?: string;
}
