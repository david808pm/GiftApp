import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SupportRequestsService } from './support-requests.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Controller('public/support-requests')
export class SupportRequestsPublicController {
  constructor(private readonly supportRequestsService: SupportRequestsService) {}

  // Limit unauthenticated submissions to curb spam / enumeration.
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post()
  create(@Body() dto: CreateSupportRequestDto) {
    return this.supportRequestsService.create(dto);
  }
}
