import { Controller, Get, Header, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CreatorService } from './creator.service';
import { CreatorResponseDto } from './dto/creator-response.dto';

// Public, static-content route — no auth/role guards by design.
@Controller('creator')
@UseInterceptors(CacheInterceptor)
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30')
  find(): Promise<CreatorResponseDto> {
    return this.creatorService.find();
  }
}
