import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class InvalidCredentialsException extends AppException {
  readonly errorCode = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}
