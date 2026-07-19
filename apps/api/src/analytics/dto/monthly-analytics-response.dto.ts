import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class MonthlyAnalyticsResponseDto {
  @Expose() month!: string;
  @Expose() averageGradePercentage!: number;
  @Expose() attendanceRatePercentage!: number;

  static fromEntities(
    entities: Record<string, unknown>[],
  ): MonthlyAnalyticsResponseDto[] {
    return entities.map((entity) =>
      plainToInstance(MonthlyAnalyticsResponseDto, entity, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
