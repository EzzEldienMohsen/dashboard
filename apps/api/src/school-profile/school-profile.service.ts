import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SCHOOL_PROFILE_REPOSITORY,
  type ISchoolProfileRepository,
} from './interfaces/school-profile-repository.interface';
import { SchoolProfileResponseDto } from './dto/school-profile-response.dto';
import { SchoolProfileNotFoundException } from '../common/exceptions/school-profile-not-found.exception';
import { withServiceError } from '../common/utils/service-error';

@Injectable()
export class SchoolProfileService {
  private readonly logger = new Logger(SchoolProfileService.name);

  constructor(
    @Inject(SCHOOL_PROFILE_REPOSITORY)
    private readonly schoolProfile: ISchoolProfileRepository,
  ) {}

  find(): Promise<SchoolProfileResponseDto> {
    return withServiceError(
      async () => {
        const profile = await this.schoolProfile.find();
        if (!profile) {
          throw new SchoolProfileNotFoundException();
        }
        return SchoolProfileResponseDto.fromEntity(profile);
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: SchoolProfileNotFoundException,
          warnContext: { msg: 'school profile not configured' },
        },
        errorContext: { msg: 'find failed unexpectedly' },
      },
    );
  }
}
