import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListClassesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  schoolId?: string;
}
