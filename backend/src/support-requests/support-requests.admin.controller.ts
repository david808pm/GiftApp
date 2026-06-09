import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupportRequestsService } from './support-requests.service';
import { UpdateSupportRequestDto } from './dto/update-support-request.dto';
import { SupportRequestQueryDto } from './dto/support-request-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@Controller('admin/support-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportRequestsAdminController {
  constructor(private readonly supportRequestsService: SupportRequestsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPANY_VIEWER')
  findAll(@Query() query: SupportRequestQueryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.supportRequestsService.findAll(query, user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPANY_VIEWER')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.supportRequestsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupportRequestDto,
    @Req() req: Request,
  ) {
    const adminUserId = (req.user as any).userId;
    return this.supportRequestsService.update(id, dto, adminUserId);
  }
}
