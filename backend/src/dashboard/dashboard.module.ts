import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardAdminController } from './dashboard.admin.controller';

@Module({
  controllers: [DashboardAdminController],
  providers: [DashboardService],
})
export class DashboardModule {}
