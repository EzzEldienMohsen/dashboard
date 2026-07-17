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
import { StudentsService } from './students.service';
import { StudentResponseDto } from './dto/student-response.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'TEACHER')
@UseInterceptors(TenantCacheInterceptor)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

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
}
