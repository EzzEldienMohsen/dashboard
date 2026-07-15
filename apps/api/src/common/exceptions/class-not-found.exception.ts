import { NotFoundAppException } from './not-found-app.exception';

export class ClassNotFoundException extends NotFoundAppException {
  readonly errorCode = 'CLASS_NOT_FOUND';

  constructor(id: string) {
    super('Class', id);
  }
}
