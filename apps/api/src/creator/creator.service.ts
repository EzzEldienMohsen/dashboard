import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CREATOR_REPOSITORY,
  type ICreatorRepository,
} from './interfaces/creator-repository.interface';
import { CreatorResponseDto } from './dto/creator-response.dto';
import { CreatorNotFoundException } from '../common/exceptions/creator-not-found.exception';
import { withServiceError } from '../common/utils/service-error';

@Injectable()
export class CreatorService {
  private readonly logger = new Logger(CreatorService.name);

  constructor(
    @Inject(CREATOR_REPOSITORY)
    private readonly creator: ICreatorRepository,
  ) {}

  find(): Promise<CreatorResponseDto> {
    return withServiceError(
      async () => {
        const creator = await this.creator.find();
        if (!creator) {
          throw new CreatorNotFoundException();
        }
        return CreatorResponseDto.fromEntity(creator);
      },
      {
        logger: this.logger,
        notFound: {
          ExceptionClass: CreatorNotFoundException,
          warnContext: { msg: 'creator profile not configured' },
        },
        errorContext: { msg: 'find failed unexpectedly' },
      },
    );
  }
}
