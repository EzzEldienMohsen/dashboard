import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class EmailAlreadyExistsException extends AppException {
  readonly errorCode = 'EMAIL_ALREADY_EXISTS';

  constructor(email: string) {
    super(`An account with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}
