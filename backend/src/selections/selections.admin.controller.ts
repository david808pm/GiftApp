import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SelectionsService } from './selections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/selections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class SelectionsAdminController {
  constructor(private readonly selectionsService: SelectionsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('campaignId') campaignId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.selectionsService.findAll({
      search,
      campaignId: campaignId !== undefined ? Number(campaignId) : undefined,
      employeeId: employeeId !== undefined ? Number(employeeId) : undefined,
      status,
      fromDate,
      toDate,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.selectionsService.findOne(id);
  }
}
