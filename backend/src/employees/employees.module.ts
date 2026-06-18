import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesAdminController } from './employees.admin.controller';

@Module({
  controllers: [EmployeesAdminController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
