import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TenantCacheInterceptor } from '../common/interceptors/tenant-cache.interceptor';
import { SchoolsService } from './schools.service';
import { SchoolResponseDto } from './dto/school-response.dto';
import { ListSchoolsQueryDto } from './dto/list-schools-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')
@UseInterceptors(TenantCacheInterceptor)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findMany(
    @Query() query: ListSchoolsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResult<SchoolResponseDto>> {
    return this.schoolsService.findMany(query, user.schoolId);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SchoolResponseDto> {
    return this.schoolsService.findById(id, user.schoolId);
  }
}
