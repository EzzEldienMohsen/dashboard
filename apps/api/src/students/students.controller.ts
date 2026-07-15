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
import { StudentsService } from './students.service';
import { StudentResponseDto } from './dto/student-response.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'TEACHER')
@UseInterceptors(CacheInterceptor)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findMany(
    @Query() query: ListStudentsQueryDto,
  ): Promise<PaginatedResult<StudentResponseDto>> {
    return this.studentsService.findMany(query);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findById(@Param('id') id: string): Promise<StudentResponseDto> {
    return this.studentsService.findById(id);
  }
}
