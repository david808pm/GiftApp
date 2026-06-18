import { Module } from '@nestjs/common';
import { SupportRequestsService } from './support-requests.service';
import { SupportRequestsAdminController } from './support-requests.admin.controller';
import { SupportRequestsPublicController } from './support-requests.public.controller';

@Module({
  controllers: [SupportRequestsAdminController, SupportRequestsPublicController],
  providers: [SupportRequestsService],
  exports: [SupportRequestsService],
})
export class SupportRequestsModule {}
