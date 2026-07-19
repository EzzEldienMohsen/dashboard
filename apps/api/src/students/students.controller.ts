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
import { I18nLang } from 'nestjs-i18n';
import { TenantCacheInterceptor } from '../common/interceptors/tenant-cache.interceptor';
import { StudentsService } from './students.service';
import { StudentResponseDto } from './dto/student-response.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { AnalyticsService } from '../analytics/analytics.service';
import { StudentAnalyticsResponseDto } from '../analytics/dto/student-analytics-response.dto';
import { MonthlyAnalyticsResponseDto } from '../analytics/dto/monthly-analytics-response.dto';
import { MonthlyAnalyticsQueryDto } from '../analytics/dto/monthly-analytics-query.dto';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'TEACHER')
@UseInterceptors(TenantCacheInterceptor)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findMany(
    @Query() query: ListStudentsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResult<StudentResponseDto>> {
    return this.studentsService.findMany(query, user.schoolId);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StudentResponseDto> {
    return this.studentsService.findById(id, user.schoolId);
  }

  @Get(':id/analytics')
  @Header('Cache-Control', 'private, max-age=30')
  getAnalytics(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @I18nLang() lang: string,
  ): Promise<StudentAnalyticsResponseDto> {
    return this.analyticsService.getStudentAnalytics(id, user.schoolId, lang);
  }

  @Get(':id/analytics/monthly')
  @Header('Cache-Control', 'private, max-age=30')
  getMonthlyAnalytics(
    @Param('id') id: string,
    @Query() query: MonthlyAnalyticsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MonthlyAnalyticsResponseDto[]> {
    return this.analyticsService.getStudentMonthlyAnalytics(
      id,
      user.schoolId,
      query.months,
    );
  }
}
