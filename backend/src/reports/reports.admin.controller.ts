import { Controller, Get, Query, UseGuards, Res, StreamableFile } from '@nestjs/common';
import { SelectionsService } from '../selections/selections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from 'express';

function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

@Controller('admin/reports/selections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ReportsAdminController {
  constructor(private readonly selectionsService: SelectionsService) {}

  @Get('export-data')
  exportData(
    @Query('campaignId') campaignId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.selectionsService.exportData({
      campaignId: campaignId !== undefined ? Number(campaignId) : undefined,
      fromDate,
      toDate,
    });
  }

  @Get('export-xlsx')
  async exportXlsx(
    @Res() res: Response,
    @Query('campaignId') campaignId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const buffer = await this.selectionsService.exportXlsx({
      campaignId: campaignId !== undefined ? Number(campaignId) : undefined,
      fromDate,
      toDate,
    });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="envios_selecciones_${todayString()}.xlsx"`,
    });

    res.send(buffer);
  }
}
