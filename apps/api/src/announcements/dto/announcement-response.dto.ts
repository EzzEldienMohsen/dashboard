import { Exclude, Expose, plainToInstance } from 'class-transformer';
import type { $Enums } from '../../../generated/prisma/client.js';

@Exclude()
export class AnnouncementResponseDto {
  @Expose() id!: string;
  @Expose() title!: string;
  @Expose() titleAr!: string | null;
  @Expose() body!: string;
  @Expose() bodyAr!: string | null;
  @Expose() category!: $Enums.AnnouncementCategory;
  @Expose() publishedAt!: Date;

  static fromEntity(entity: Record<string, unknown>): AnnouncementResponseDto {
    return plainToInstance(AnnouncementResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
