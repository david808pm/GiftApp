import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ImportsService, ImportResult } from './imports.service';
import { Request } from 'express';

@Controller('admin/import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportsAdminController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('employees-beneficiaries')
  @HttpCode(HttpStatus.OK)
  @Roles('SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  uploadEmployeesBeneficiaries(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<ImportResult> {
    const adminUserId = (req.user as any).userId;
    return this.importsService.importEmployeesBeneficiaries(
      file,
      adminUserId,
    );
  }
}
