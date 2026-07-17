import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementResponseDto } from './dto/announcement-response.dto';
import { ListAnnouncementsQueryDto } from './dto/list-announcements-query.dto';
import { CursorPaginationQueryDto } from '../common/dto/cursor-pagination-query.dto';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import type { CursorPaginatedResult } from '../common/interfaces/cursor-paginated-result.interface';

// Public, static-content route — no auth/role guards by design.
@Controller('announcements')
@UseInterceptors(CacheInterceptor)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=30')
  findMany(
    @Query() query: ListAnnouncementsQueryDto,
  ): Promise<PaginatedResult<AnnouncementResponseDto>> {
    return this.announcementsService.findMany(query);
  }

  @Get('cursor')
  @Header('Cache-Control', 'public, max-age=30')
  findManyCursor(
    @Query() query: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResult<AnnouncementResponseDto>> {
    return this.announcementsService.findManyCursor(query);
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=30')
  findById(@Param('id') id: string): Promise<AnnouncementResponseDto> {
    return this.announcementsService.findById(id);
  }
}
