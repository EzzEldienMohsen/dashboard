import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class StudentNotFoundException extends AppException {
  readonly errorCode = 'STUDENT_NOT_FOUND';

  constructor(id: string) {
    super(`Student with id ${id} was not found`, HttpStatus.NOT_FOUND);
  }
}
