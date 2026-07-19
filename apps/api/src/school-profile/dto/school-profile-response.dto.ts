import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class SchoolProfileResponseDto {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() nameAr!: string | null;
  @Expose() mission!: string;
  @Expose() missionAr!: string | null;
  @Expose() foundedYear!: number;
  @Expose() address!: string;
  @Expose() contactEmail!: string;
  @Expose() contactPhone!: string | null;
  @Expose() updatedAt!: Date;

  static fromEntity(entity: Record<string, unknown>): SchoolProfileResponseDto {
    return plainToInstance(SchoolProfileResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
