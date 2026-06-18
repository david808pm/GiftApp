import { Module } from '@nestjs/common';
import { ImportsAdminController } from './imports.admin.controller';
import { ImportsService } from './imports.service';

@Module({
  controllers: [ImportsAdminController],
  providers: [ImportsService],
})
export class ImportsModule {}
