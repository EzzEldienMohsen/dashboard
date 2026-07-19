import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class SchoolNotConfiguredException extends AppException {
  readonly errorCode = 'SCHOOL_NOT_CONFIGURED';

  constructor() {
    super(
      'No school is configured for this deployment',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
