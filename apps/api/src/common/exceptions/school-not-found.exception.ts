import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class SchoolNotFoundException extends AppException {
  readonly errorCode = 'SCHOOL_NOT_FOUND';

  constructor(id: string) {
    super(`School with id ${id} was not found`, HttpStatus.NOT_FOUND);
  }
}
