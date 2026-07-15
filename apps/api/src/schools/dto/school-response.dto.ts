import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class SchoolResponseDto {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() address!: string | null;

  static fromEntity(entity: Record<string, unknown>): SchoolResponseDto {
    return plainToInstance(SchoolResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
