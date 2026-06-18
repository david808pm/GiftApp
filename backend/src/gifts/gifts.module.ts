import { Module } from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { GiftsAdminController } from './gifts.admin.controller';

@Module({
  controllers: [GiftsAdminController],
  providers: [GiftsService],
  exports: [GiftsService],
})
export class GiftsModule {}
