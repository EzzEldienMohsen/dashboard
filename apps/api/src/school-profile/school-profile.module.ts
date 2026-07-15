import { Module } from '@nestjs/common';
import { SchoolProfileController } from './school-profile.controller';
import { SchoolProfileService } from './school-profile.service';
import { SCHOOL_PROFILE_REPOSITORY } from './interfaces/school-profile-repository.interface';
import { PrismaSchoolProfileRepository } from './repositories/prisma-school-profile.repository';

@Module({
  controllers: [SchoolProfileController],
  providers: [
    SchoolProfileService,
    {
      provide: SCHOOL_PROFILE_REPOSITORY,
      useClass: PrismaSchoolProfileRepository,
    },
  ],
})
export class SchoolProfileModule {}
