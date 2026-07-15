import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SCHOOL_PROFILE_REPOSITORY,
  type ISchoolProfileRepository,
} from './interfaces/school-profile-repository.interface';
import { SchoolProfileResponseDto } from './dto/school-profile-response.dto';
import { SchoolProfileNotFoundException } from '../common/exceptions/school-profile-not-found.exception';

@Injectable()
export class SchoolProfileService {
  private readonly logger = new Logger(SchoolProfileService.name);

  constructor(
    @Inject(SCHOOL_PROFILE_REPOSITORY)
    private readonly schoolProfile: ISchoolProfileRepository,
  ) {}

  async find(): Promise<SchoolProfileResponseDto> {
    try {
      const profile = await this.schoolProfile.find();
      if (!profile) {
        throw new SchoolProfileNotFoundException();
      }

      return SchoolProfileResponseDto.fromEntity(profile);
    } catch (err: unknown) {
      if (err instanceof SchoolProfileNotFoundException) {
        this.logger.warn({ msg: 'school profile not configured' });
        throw err;
      }
      this.logger.error({ msg: 'find failed unexpectedly', err });
      throw err; // rethrown for AllExceptionsFilter to normalize, log with breadcrumbs, and report to Sentry
    }
  }
}
