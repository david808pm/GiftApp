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
import { GiftsService } from './gifts.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { UpdateGiftDto } from './dto/update-gift.dto';
import { GiftQueryDto } from './dto/gift-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@Controller('admin/gifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GiftsAdminController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPANY_VIEWER')
  findAll(@Query() query: GiftQueryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.giftsService.findAll(query, user);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'COMPANY_VIEWER')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.giftsService.findOne(id, user);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateGiftDto, @Req() req: Request) {
    const adminUserId = (req.user as any).userId;
    return this.giftsService.create(dto, adminUserId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGiftDto,
    @Req() req: Request,
  ) {
    const adminUserId = (req.user as any).userId;
    return this.giftsService.update(id, dto, adminUserId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('SUPER_ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.giftsService.remove(id);
  }
}
