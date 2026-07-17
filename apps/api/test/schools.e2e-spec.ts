import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type ErrorResponseBody } from './create-test-app';
import {
  SCHOOL_REPOSITORY,
  type ISchoolRepository,
} from './../src/schools/interfaces/school-repository.interface';
import type { SchoolResponseDto } from './../src/schools/dto/school-response.dto';
import type { AuthResponseDto } from './../src/auth/dto/auth-response.dto';
import type { PaginatedResult } from './../src/common/interfaces/paginated-result.interface';
import { PrismaService } from './../src/prisma/prisma.service';

describe('SchoolsController (e2e)', () => {
  let app: INestApplication<App>;
  let managerToken: string;
  let teacherToken: string;
  let prisma: PrismaService;
  let otherSchoolId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    const managerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'manager@schooldashboard.dev', password: 'Password123!' });
    managerToken = (managerLogin.body as AuthResponseDto).accessToken;

    const teacherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teacher@schooldashboard.dev', password: 'Password123!' });
    teacherToken = (teacherLogin.body as AuthResponseDto).accessToken;

    otherSchoolId = randomUUID();
    await prisma.school.create({
      data: { id: otherSchoolId, name: 'Other School (e2e fixture)' },
    });
  });

  afterAll(async () => {
    await prisma.school.delete({ where: { id: otherSchoolId } });
    await app.close();
  });

  it('returns a paginated list for a manager', async () => {
    const res = await request(app.getHttpServer())
      .get('/schools')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    const body = res.body as PaginatedResult<SchoolResponseDto>;

    expect(body).toMatchObject({ page: 1, limit: 20 });
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.items[0].id).toBe('string');
    expect(typeof body.items[0].name).toBe('string');
  });

  it('forbids a teacher from listing schools', async () => {
    await request(app.getHttpServer())
      .get('/schools')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(403);
  });

  it('rejects an unauthenticated request', async () => {
    await request(app.getHttpServer()).get('/schools').expect(401);
  });

  it('fetches a school by id', async () => {
    const list = await request(app.getHttpServer())
      .get('/schools')
      .set('Authorization', `Bearer ${managerToken}`);
    const schoolId = (list.body as PaginatedResult<SchoolResponseDto>).items[0]
      .id;

    const res = await request(app.getHttpServer())
      .get(`/schools/${schoolId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect((res.body as SchoolResponseDto).id).toBe(schoolId);
  });

  it('returns a mapped 404 for an unknown id', async () => {
    const res = await request(app.getHttpServer())
      .get('/schools/does-not-exist')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(404);

    expect((res.body as ErrorResponseBody).errorCode).toBe('SCHOOL_NOT_FOUND');
  });

  it('returns 404 for a different school, never leaking cross-tenant data', async () => {
    const res = await request(app.getHttpServer())
      .get(`/schools/${otherSchoolId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(404);

    expect((res.body as ErrorResponseBody).errorCode).toBe('SCHOOL_NOT_FOUND');
  });

  it('never includes another school in the list results', async () => {
    const res = await request(app.getHttpServer())
      .get('/schools')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    const body = res.body as PaginatedResult<SchoolResponseDto>;

    expect(body.items.some((item) => item.id === otherSchoolId)).toBe(false);
  });

  it('rejects an out-of-range page', async () => {
    await request(app.getHttpServer())
      .get('/schools?page=0')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(400);
  });

  it('rejects a limit above the max', async () => {
    await request(app.getHttpServer())
      .get('/schools?limit=101')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(400);
  });

  it('serves the second identical request from cache without hitting the repository', async () => {
    const repository = app.get<ISchoolRepository>(SCHOOL_REPOSITORY);
    const spy = jest.spyOn(repository, 'findMany');
    spy.mockClear();

    await request(app.getHttpServer())
      .get('/schools?page=1&limit=5')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/schools?page=1&limit=5')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
