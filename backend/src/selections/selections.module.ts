import { Module } from '@nestjs/common';
import { SelectionsService } from './selections.service';
import { SelectionsAdminController } from './selections.admin.controller';

@Module({
  controllers: [SelectionsAdminController],
  providers: [SelectionsService],
  exports: [SelectionsService],
})
export class SelectionsModule {}
