import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type ErrorResponseBody } from './create-test-app';
import {
  ANNOUNCEMENT_REPOSITORY,
  type IAnnouncementRepository,
} from './../src/announcements/interfaces/announcement-repository.interface';
import type { AnnouncementResponseDto } from './../src/announcements/dto/announcement-response.dto';
import type { PaginatedResult } from './../src/common/interfaces/paginated-result.interface';

describe('AnnouncementsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a paginated list without authentication', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/announcements')
      .expect(200);
    const body = res.body as PaginatedResult<AnnouncementResponseDto>;

    expect(body).toMatchObject({ page: 1, limit: 20 });
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.items[0].id).toBe('string');
    expect(typeof body.items[0].title).toBe('string');
  });

  it('filters by category', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/announcements?category=EXAM')
      .expect(200);
    const body = res.body as PaginatedResult<AnnouncementResponseDto>;

    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item) => item.category === 'EXAM')).toBe(true);
  });

  it('rejects an invalid category', async () => {
    await request(app.getHttpServer())
      .get('/v1/announcements?category=NOT_A_CATEGORY')
      .expect(400);
  });

  it('fetches an announcement by id', async () => {
    const list = await request(app.getHttpServer()).get('/v1/announcements');
    const announcementId = (
      list.body as PaginatedResult<AnnouncementResponseDto>
    ).items[0].id;

    const res = await request(app.getHttpServer())
      .get(`/v1/announcements/${announcementId}`)
      .expect(200);

    expect((res.body as AnnouncementResponseDto).id).toBe(announcementId);
  });

  it('returns a mapped 404 for an unknown id', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/announcements/does-not-exist')
      .expect(404);

    expect((res.body as ErrorResponseBody).errorCode).toBe(
      'ANNOUNCEMENT_NOT_FOUND',
    );
  });

  it('rejects an out-of-range page', async () => {
    await request(app.getHttpServer())
      .get('/v1/announcements?page=0')
      .expect(400);
  });

  it('serves the second identical request from cache without hitting the repository', async () => {
    const repository = app.get<IAnnouncementRepository>(
      ANNOUNCEMENT_REPOSITORY,
    );
    const spy = jest.spyOn(repository, 'findMany');
    spy.mockClear();

    await request(app.getHttpServer())
      .get('/v1/announcements?page=1&limit=5')
      .expect(200);
    await request(app.getHttpServer())
      .get('/v1/announcements?page=1&limit=5')
      .expect(200);

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
