import { NotFoundAppException } from './not-found-app.exception';

export class StudentNotFoundException extends NotFoundAppException {
  readonly errorCode = 'STUDENT_NOT_FOUND';

  constructor(id: string) {
    super('Student', id);
  }
}
