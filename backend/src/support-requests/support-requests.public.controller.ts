import { Controller, Post, Body } from '@nestjs/common';
import { SupportRequestsService } from './support-requests.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Controller('public/support-requests')
export class SupportRequestsPublicController {
  constructor(private readonly supportRequestsService: SupportRequestsService) {}

  @Post()
  create(@Body() dto: CreateSupportRequestDto) {
    return this.supportRequestsService.create(dto);
  }
}
