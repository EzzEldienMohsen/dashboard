import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class StudentResponseDto {
  @Expose() id!: string;
  @Expose() firstName!: string;
  @Expose() lastName!: string;
  @Expose() classId!: string;

  static fromEntity(entity: Record<string, unknown>): StudentResponseDto {
    return plainToInstance(StudentResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
