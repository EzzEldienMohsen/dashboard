import { Module } from '@nestjs/common';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';
import { CREATOR_REPOSITORY } from './interfaces/creator-repository.interface';
import { PrismaCreatorRepository } from './repositories/prisma-creator.repository';

@Module({
  controllers: [CreatorController],
  providers: [
    CreatorService,
    {
      provide: CREATOR_REPOSITORY,
      useClass: PrismaCreatorRepository,
    },
  ],
})
export class CreatorModule {}
