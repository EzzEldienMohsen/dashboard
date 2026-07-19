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
class AdviceItemDto {
  @Expose() subject!: string;
  @Expose() severity!: 'strength' | 'weakness';
  @Expose() message!: string;
}

@Exclude()
export class StudentAnalyticsResponseDto {
  @Expose() attendanceRatePercentage!: number;
  @Expose()
  @Type(() => AttendanceBreakdownDto)
  attendanceBreakdown!: AttendanceBreakdownDto;
  @Expose() averageGradePercentage!: number;
  @Expose()
  @Type(() => SubjectAverageDto)
  gradesBySubject!: SubjectAverageDto[];
  @Expose() improvementRatePercentage!: number;
  @Expose()
  @Type(() => SubjectAverageDto)
  strengths!: SubjectAverageDto[];
  @Expose()
  @Type(() => SubjectAverageDto)
  weaknesses!: SubjectAverageDto[];
  @Expose()
  @Type(() => AdviceItemDto)
  advice!: AdviceItemDto[];

  static fromEntity(
    entity: Record<string, unknown>,
  ): StudentAnalyticsResponseDto {
    return plainToInstance(StudentAnalyticsResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
