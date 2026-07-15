import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './create-test-app';
import {
  SCHOOL_PROFILE_REPOSITORY,
  type ISchoolProfileRepository,
} from './../src/school-profile/interfaces/school-profile-repository.interface';
import type { SchoolProfileResponseDto } from './../src/school-profile/dto/school-profile-response.dto';

describe('SchoolProfileController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  // The single `/school-profile` route has no query params to vary, so the cache-hit
  // assertion is folded into the first request made against the app — any later test
  // would find the response already cached from an earlier call.
  it('returns the school profile without authentication, then serves a repeat request from cache', async () => {
    const repository = app.get<ISchoolProfileRepository>(
      SCHOOL_PROFILE_REPOSITORY,
    );
    const spy = jest.spyOn(repository, 'find');
    spy.mockClear();

    const res = await request(app.getHttpServer())
      .get('/school-profile')
      .expect(200);
    const body = res.body as SchoolProfileResponseDto;

    expect(typeof body.id).toBe('string');
    expect(typeof body.name).toBe('string');
    expect(typeof body.mission).toBe('string');

    await request(app.getHttpServer()).get('/school-profile').expect(200);

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
