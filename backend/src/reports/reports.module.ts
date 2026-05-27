import { Module } from '@nestjs/common';
import { SelectionsModule } from '../selections/selections.module';
import { ReportsAdminController } from './reports.admin.controller';

@Module({
  imports: [SelectionsModule],
  controllers: [ReportsAdminController],
})
export class ReportsModule {}
