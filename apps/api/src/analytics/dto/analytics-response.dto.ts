import { Exclude, Expose, Type, plainToInstance } from 'class-transformer';

@Exclude()
class AttendanceBreakdownDto {
  @Expose() present!: number;
  @Expose() absent!: number;
  @Expose() late!: number;
  @Expose() excused!: number;
}

@Exclude()
class SubjectAverageDto {
  @Expose() subject!: string;
  @Expose() averagePercentage!: number;
}

@Exclude()
export class AnalyticsResponseDto {
  @Expose() attendanceRatePercentage!: number;
  @Expose()
  @Type(() => AttendanceBreakdownDto)
  attendanceBreakdown!: AttendanceBreakdownDto;
  @Expose() averageGradePercentage!: number;
  @Expose()
  @Type(() => SubjectAverageDto)
  gradesBySubject!: SubjectAverageDto[];
  @Expose() improvementRatePercentage!: number;

  static fromEntity(entity: Record<string, unknown>): AnalyticsResponseDto {
    return plainToInstance(AnalyticsResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
