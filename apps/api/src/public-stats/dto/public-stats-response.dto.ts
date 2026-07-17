import { ApiProperty } from '@nestjs/swagger';

export class PublicStatsResponseDto {
  @ApiProperty({ example: 12 })
  schoolsCount!: number;

  @ApiProperty({ example: 340 })
  studentsCount!: number;

  @ApiProperty({ example: 28 })
  teachersCount!: number;
}
