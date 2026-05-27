import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesAdminController } from './beneficiaries.admin.controller';

@Module({
  controllers: [BeneficiariesAdminController],
  providers: [BeneficiariesService],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {}
