import { NotFoundAppException } from './not-found-app.exception';

export class SchoolNotFoundException extends NotFoundAppException {
  readonly errorCode = 'SCHOOL_NOT_FOUND';

  constructor(id: string) {
    super('School', id);
  }
}
