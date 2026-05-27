import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsAdminController } from './campaigns.admin.controller';
import { CampaignsPublicController } from './campaigns.public.controller';

@Module({
  controllers: [CampaignsAdminController, CampaignsPublicController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
