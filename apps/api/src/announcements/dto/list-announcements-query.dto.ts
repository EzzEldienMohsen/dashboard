import { IsEnum, IsOptional } from 'class-validator';
import { $Enums } from '../../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListAnnouncementsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum($Enums.AnnouncementCategory)
  category?: $Enums.AnnouncementCategory;
}
