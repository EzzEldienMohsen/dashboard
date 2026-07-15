import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class SchoolProfileNotFoundException extends AppException {
  readonly errorCode = 'SCHOOL_PROFILE_NOT_FOUND';

  constructor() {
    super('School profile has not been configured yet', HttpStatus.NOT_FOUND);
  }
}
