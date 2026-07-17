import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/** schoolId is derived server-side from the authenticated caller — never client-suppliable. */
export class ListClassesQueryDto extends PaginationQueryDto {}
