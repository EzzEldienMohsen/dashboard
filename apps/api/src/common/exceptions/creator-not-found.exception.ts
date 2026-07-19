import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class CreatorNotFoundException extends AppException {
  readonly errorCode = 'CREATOR_NOT_FOUND';

  constructor() {
    super('Creator profile has not been configured yet', HttpStatus.NOT_FOUND);
  }
}
