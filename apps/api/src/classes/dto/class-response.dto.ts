import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class ClassResponseDto {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() schoolId!: string;

  static fromEntity(entity: Record<string, unknown>): ClassResponseDto {
    return plainToInstance(ClassResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
