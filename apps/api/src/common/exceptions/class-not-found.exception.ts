import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ClassNotFoundException extends AppException {
  readonly errorCode = 'CLASS_NOT_FOUND';

  constructor(id: string) {
    super(`Class with id ${id} was not found`, HttpStatus.NOT_FOUND);
  }
}
