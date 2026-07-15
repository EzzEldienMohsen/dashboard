import { Controller, Get, Header, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SchoolProfileService } from './school-profile.service';
import { SchoolProfileResponseDto } from './dto/school-profile-response.dto';

// Public, static-content route — no auth/role guards by design.
@Controller('school-profile')
@UseInterceptors(CacheInterceptor)
export class SchoolProfileController {
  constructor(private readonly schoolProfileService: SchoolProfileService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30')
  find(): Promise<SchoolProfileResponseDto> {
    return this.schoolProfileService.find();
  }
}
