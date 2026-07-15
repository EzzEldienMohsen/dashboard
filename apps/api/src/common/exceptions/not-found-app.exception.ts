import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

/** Shared "resource with id X was not found" shape — subclasses only add an errorCode. */
export abstract class NotFoundAppException extends AppException {
  protected constructor(resource: string, id: string) {
    super(`${resource} with id ${id} was not found`, HttpStatus.NOT_FOUND);
  }
}
