import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PublicAuthService } from './public-auth.service';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { PublicEmployeeJwtGuard } from './guards/public-employee-jwt.guard';
import { Request } from 'express';

@Controller('public')
export class PublicAuthController {
  constructor(private readonly publicAuthService: PublicAuthService) {}

  @Post('campaigns/:slug/employee-login')
  @HttpCode(HttpStatus.OK)
  employeeLogin(@Param('slug') slug: string, @Body() dto: EmployeeLoginDto) {
    return this.publicAuthService.employeeLogin(slug, dto);
  }

  @Get('employee-session/me')
  @UseGuards(PublicEmployeeJwtGuard)
  getSession(@Req() req: Request) {
    return this.publicAuthService.getSession(req.user as any);
  }
}
