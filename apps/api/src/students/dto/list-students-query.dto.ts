import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListStudentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  classId?: string;
}
