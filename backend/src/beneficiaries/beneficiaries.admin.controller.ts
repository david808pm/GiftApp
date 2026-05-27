import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { BeneficiaryQueryDto } from './dto/beneficiary-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@Controller('admin/beneficiaries')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class BeneficiariesAdminController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Get()
  findAll(@Query() query: BeneficiaryQueryDto) {
    return this.beneficiariesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.beneficiariesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBeneficiaryDto, @Req() req: Request) {
    const adminUserId = (req.user as any).userId;
    return this.beneficiariesService.create(dto, adminUserId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBeneficiaryDto,
    @Req() req: Request,
  ) {
    const adminUserId = (req.user as any).userId;
    return this.beneficiariesService.update(id, dto, adminUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.beneficiariesService.remove(id);
  }
}
