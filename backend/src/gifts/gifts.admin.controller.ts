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
@Roles('ADMIN')
export class GiftsAdminController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  findAll(@Query() query: GiftQueryDto) {
    return this.giftsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.giftsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGiftDto, @Req() req: Request) {
    const adminUserId = (req.user as any).userId;
    return this.giftsService.create(dto, adminUserId);
  }

  @Patch(':id')
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.giftsService.remove(id);
  }
}
