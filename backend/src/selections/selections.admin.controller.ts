import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SelectionsService } from './selections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@Controller('admin/selections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SelectionsAdminController {
  constructor(private readonly selectionsService: SelectionsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPANY_VIEWER')
  findAll(
    @Query('search') search?: string,
    @Query('campaignId') campaignId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Req() req?: Request,
  ) {
    const user = req?.user as any;
    return this.selectionsService.findAll(
      {
        search,
        campaignId: campaignId !== undefined ? Number(campaignId) : undefined,
        employeeId: employeeId !== undefined ? Number(employeeId) : undefined,
        status,
        fromDate,
        toDate,
      },
      user,
    );
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPANY_VIEWER')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.selectionsService.findOne(id, user);
  }
}
