import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { EmployeesModule } from './employees/employees.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { GiftsModule } from './gifts/gifts.module';
import { SupportRequestsModule } from './support-requests/support-requests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SelectionsModule } from './selections/selections.module';
import { ReportsModule } from './reports/reports.module';
import { PublicAuthModule } from './public-auth/public-auth.module';
import { PublicSelectionModule } from './public-selection/public-selection.module';
import { ImportsModule } from './imports/imports.module';

@Module({
  imports: [PrismaModule, AuthModule, CampaignsModule, EmployeesModule, BeneficiariesModule, GiftsModule, SupportRequestsModule, DashboardModule, SelectionsModule, ReportsModule, PublicAuthModule, PublicSelectionModule, ImportsModule],
})
export class AppModule {}
