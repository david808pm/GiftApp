import { Module } from '@nestjs/common';
import { PublicSelectionService } from './public-selection.service';
import { PublicSelectionController } from './public-selection.controller';

@Module({
  controllers: [PublicSelectionController],
  providers: [PublicSelectionService],
})
export class PublicSelectionModule {}
