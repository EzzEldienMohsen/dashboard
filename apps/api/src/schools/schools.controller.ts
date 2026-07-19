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
import { SchoolsService } from './schools.service';
import { SchoolResponseDto } from './dto/school-response.dto';
import { ListSchoolsQueryDto } from './dto/list-schools-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsResponseDto } from '../analytics/dto/analytics-response.dto';
import { MonthlyAnalyticsResponseDto } from '../analytics/dto/monthly-analytics-response.dto';
import { MonthlyAnalyticsQueryDto } from '../analytics/dto/monthly-analytics-query.dto';
import { ClassSummaryResponseDto } from '../analytics/dto/class-summary-response.dto';

@ApiTags('schools')
@ApiBearerAuth()
@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')
@UseInterceptors(TenantCacheInterceptor)
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

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

  @Get(':id/analytics')
  @Header('Cache-Control', 'private, max-age=30')
  getAnalytics(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getSchoolAnalytics(id, user.schoolId);
  }

  @Get(':id/analytics/monthly')
  @Header('Cache-Control', 'private, max-age=30')
  getMonthlyAnalytics(
    @Param('id') id: string,
    @Query() query: MonthlyAnalyticsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MonthlyAnalyticsResponseDto[]> {
    return this.analyticsService.getSchoolMonthlyAnalytics(
      id,
      user.schoolId,
      query.months,
    );
  }

  @Get(':id/classes/analytics-summary')
  @Header('Cache-Control', 'private, max-age=30')
  getClassesAnalyticsSummary(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ClassSummaryResponseDto[]> {
    return this.analyticsService.getClassesSummaryForSchool(id, user.schoolId);
  }
}
