import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantCacheInterceptor } from '../common/interceptors/tenant-cache.interceptor';
import { ClassesService } from './classes.service';
import { ClassResponseDto } from './dto/class-response.dto';
import { ListClassesQueryDto } from './dto/list-classes-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsResponseDto } from '../analytics/dto/analytics-response.dto';

@ApiTags('classes')
@ApiBearerAuth()
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'TEACHER')
@UseInterceptors(TenantCacheInterceptor)
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findMany(
    @Query() query: ListClassesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResult<ClassResponseDto>> {
    return this.classesService.findMany(query, user.schoolId);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ClassResponseDto> {
    return this.classesService.findById(id, user.schoolId);
  }

  @Get(':id/analytics')
  @Header('Cache-Control', 'private, max-age=30')
  getAnalytics(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getClassAnalytics(id, user.schoolId);
  }
}
