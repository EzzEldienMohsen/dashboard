import { NotFoundAppException } from './not-found-app.exception';

export class AnnouncementNotFoundException extends NotFoundAppException {
  readonly errorCode = 'ANNOUNCEMENT_NOT_FOUND';

  constructor(id: string) {
    super('Announcement', id);
  }
}
