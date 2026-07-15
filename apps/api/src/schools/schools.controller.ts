import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { SchoolsService } from './schools.service';
import { SchoolResponseDto } from './dto/school-response.dto';
import { ListSchoolsQueryDto } from './dto/list-schools-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')
@UseInterceptors(CacheInterceptor)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findMany(
    @Query() query: ListSchoolsQueryDto,
  ): Promise<PaginatedResult<SchoolResponseDto>> {
    return this.schoolsService.findMany(query);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findById(@Param('id') id: string): Promise<SchoolResponseDto> {
    return this.schoolsService.findById(id);
  }
}
