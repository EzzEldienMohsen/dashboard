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
export class ClassSummaryResponseDto {
  @Expose() classId!: string;
  @Expose() className!: string;
  @Expose() attendanceRatePercentage!: number;
  @Expose()
  @Type(() => AttendanceBreakdownDto)
  attendanceBreakdown!: AttendanceBreakdownDto;
  @Expose() averageGradePercentage!: number;
  @Expose()
  @Type(() => SubjectAverageDto)
  gradesBySubject!: SubjectAverageDto[];

  static fromEntities(
    entities: Record<string, unknown>[],
  ): ClassSummaryResponseDto[] {
    return entities.map((entity) =>
      plainToInstance(ClassSummaryResponseDto, entity, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
