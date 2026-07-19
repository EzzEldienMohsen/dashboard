import { Exclude, Expose, plainToInstance } from 'class-transformer';

@Exclude()
export class CreatorResponseDto {
  @Expose() id!: string;
  @Expose() name!: string;
  @Expose() role!: string;
  @Expose() bio!: string;
  @Expose() skills!: string[];
  @Expose() email!: string | null;
  @Expose() githubUrl!: string | null;
  @Expose() linkedinUrl!: string | null;
  @Expose() portfolioUrl!: string | null;
  @Expose() updatedAt!: Date;

  static fromEntity(entity: Record<string, unknown>): CreatorResponseDto {
    return plainToInstance(CreatorResponseDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
