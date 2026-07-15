import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { ANNOUNCEMENT_REPOSITORY } from './interfaces/announcement-repository.interface';
import { PrismaAnnouncementRepository } from './repositories/prisma-announcement.repository';

@Module({
  controllers: [AnnouncementsController],
  providers: [
    AnnouncementsService,
    {
      provide: ANNOUNCEMENT_REPOSITORY,
      useClass: PrismaAnnouncementRepository,
    },
  ],
})
export class AnnouncementsModule {}
