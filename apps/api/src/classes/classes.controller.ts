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
import { ClassesService } from './classes.service';
import { ClassResponseDto } from './dto/class-response.dto';
import { ListClassesQueryDto } from './dto/list-classes-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER', 'TEACHER')
@UseInterceptors(CacheInterceptor)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findMany(
    @Query() query: ListClassesQueryDto,
  ): Promise<PaginatedResult<ClassResponseDto>> {
    return this.classesService.findMany(query);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=30')
  findById(@Param('id') id: string): Promise<ClassResponseDto> {
    return this.classesService.findById(id);
  }
}
