import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type ErrorResponseBody } from './create-test-app';
import {
  CLASS_REPOSITORY,
  type IClassRepository,
} from './../src/classes/interfaces/class-repository.interface';
import type { ClassResponseDto } from './../src/classes/dto/class-response.dto';
import type { SchoolResponseDto } from './../src/schools/dto/school-response.dto';
import type { AuthResponseDto } from './../src/auth/dto/auth-response.dto';
import type { PaginatedResult } from './../src/common/interfaces/paginated-result.interface';

describe('ClassesController (e2e)', () => {
  let app: INestApplication<App>;
  let managerToken: string;
  let teacherToken: string;
  let schoolId: string;

  beforeAll(async () => {
    app = await createTestApp();

    const managerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'manager@schooldashboard.dev', password: 'Password123!' });
    managerToken = (managerLogin.body as AuthResponseDto).accessToken;

    const teacherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teacher@schooldashboard.dev', password: 'Password123!' });
    teacherToken = (teacherLogin.body as AuthResponseDto).accessToken;

    const schools = await request(app.getHttpServer())
      .get('/schools')
      .set('Authorization', `Bearer ${managerToken}`);
    schoolId = (schools.body as PaginatedResult<SchoolResponseDto>).items[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a paginated list for a manager', async () => {
    const res = await request(app.getHttpServer())
      .get('/classes')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(
      Array.isArray((res.body as PaginatedResult<ClassResponseDto>).items),
    ).toBe(true);
  });

  it('also allows a teacher to list classes', async () => {
    await request(app.getHttpServer())
      .get('/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);
  });

  it('rejects an unauthenticated request', async () => {
    await request(app.getHttpServer()).get('/classes').expect(401);
  });

  it('filters by schoolId', async () => {
    const res = await request(app.getHttpServer())
      .get(`/classes?schoolId=${schoolId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    const body = res.body as PaginatedResult<ClassResponseDto>;

    expect(body.items.length).toBeGreaterThan(0);
    for (const item of body.items) {
      expect(item.schoolId).toBe(schoolId);
    }
  });

  it('fetches a class by id', async () => {
    const list = await request(app.getHttpServer())
      .get('/classes')
      .set('Authorization', `Bearer ${managerToken}`);
    const classId = (list.body as PaginatedResult<ClassResponseDto>).items[0]
      .id;

    const res = await request(app.getHttpServer())
      .get(`/classes/${classId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);

    expect((res.body as ClassResponseDto).id).toBe(classId);
  });

  it('returns a mapped 404 for an unknown id', async () => {
    const res = await request(app.getHttpServer())
      .get('/classes/does-not-exist')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(404);

    expect((res.body as ErrorResponseBody).errorCode).toBe('CLASS_NOT_FOUND');
  });

  it('rejects an out-of-range page', async () => {
    await request(app.getHttpServer())
      .get('/classes?page=0')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(400);
  });

  it('serves the second identical request from cache without hitting the repository', async () => {
    const repository = app.get<IClassRepository>(CLASS_REPOSITORY);
    const spy = jest.spyOn(repository, 'findMany');
    spy.mockClear();

    await request(app.getHttpServer())
      .get('/classes?page=1&limit=5')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/classes?page=1&limit=5')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
