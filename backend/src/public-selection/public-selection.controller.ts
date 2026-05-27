import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PublicSelectionService } from './public-selection.service';
import { ConfirmSelectionDto } from './dto/confirm-selection.dto';
import { PublicEmployeeJwtGuard } from '../public-auth/guards/public-employee-jwt.guard';
import { Request } from 'express';

@Controller('public')
@UseGuards(PublicEmployeeJwtGuard)
export class PublicSelectionController {
  constructor(private readonly publicSelectionService: PublicSelectionService) {}

  @Get('beneficiaries')
  getBeneficiaries(@Req() req: Request) {
    return this.publicSelectionService.getBeneficiaries(req.user as any);
  }

  @Get('beneficiaries/:beneficiaryId/gifts')
  getCompatibleGifts(
    @Param('beneficiaryId', ParseIntPipe) beneficiaryId: number,
    @Req() req: Request,
  ) {
    return this.publicSelectionService.getCompatibleGifts(
      beneficiaryId,
      req.user as any,
    );
  }

  @Post('selections/confirm')
  @HttpCode(HttpStatus.OK)
  confirmSelection(@Body() dto: ConfirmSelectionDto, @Req() req: Request) {
    return this.publicSelectionService.confirmSelection(
      dto,
      req.user as any,
    );
  }

  @Get('selections/my-confirmed-selection')
  getConfirmedSelection(@Req() req: Request) {
    return this.publicSelectionService.getConfirmedSelection(req.user as any);
  }
}
