import { Exclude, Expose, plainToInstance } from 'class-transformer';

/**
 * Whitelist-based response shape: only @Expose()d fields survive serialization,
 * so passwordHash (or any future sensitive field) can never leak by omission.
 */
@Exclude()
export class UserResponseDto {
  @Expose() id!: string;
  @Expose() email!: string;
  @Expose() role!: string;
  @Expose() name!: string;
  @Expose() phone!: string;
  @Expose() country!: string;
  @Expose() createdAt!: Date;

  static fromEntity(entity: Record<string, unknown>): UserResponseDto {
    return plainToInstance(UserResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
