import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type ErrorResponseBody } from './create-test-app';
import {
  STUDENT_REPOSITORY,
  type IStudentRepository,
} from './../src/students/interfaces/student-repository.interface';
import type { StudentResponseDto } from './../src/students/dto/student-response.dto';
import type { ClassResponseDto } from './../src/classes/dto/class-response.dto';
import type { AuthResponseDto } from './../src/auth/dto/auth-response.dto';
import type { PaginatedResult } from './../src/common/interfaces/paginated-result.interface';
import { PrismaService } from './../src/prisma/prisma.service';

describe('StudentsController (e2e)', () => {
  let app: INestApplication<App>;
  let managerToken: string;
  let teacherToken: string;
  let classId: string;
  let prisma: PrismaService;
  let otherSchoolId: string;
  let otherStudentId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    const managerLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'manager@schooldashboard.dev', password: 'Password123!' });
    managerToken = (managerLogin.body as AuthResponseDto).accessToken;

    const teacherLogin = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'teacher@schooldashboard.dev', password: 'Password123!' });
    teacherToken = (teacherLogin.body as AuthResponseDto).accessToken;

    const classes = await request(app.getHttpServer())
      .get('/v1/classes')
      .set('Authorization', `Bearer ${managerToken}`);
    classId = (classes.body as PaginatedResult<ClassResponseDto>).items[0].id;

    otherSchoolId = randomUUID();
    await prisma.school.create({
      data: { id: otherSchoolId, name: 'Other School (e2e fixture)' },
    });
    const otherClassId = randomUUID();
    await prisma.class.create({
      data: {
        id: otherClassId,
        name: 'Other School Class',
        schoolId: otherSchoolId,
      },
    });
    otherStudentId = randomUUID();
    await prisma.student.create({
      data: {
        id: otherStudentId,
        firstName: 'Other',
        lastName: 'Student',
        classId: otherClassId,
      },
    });
  });

  afterAll(async () => {
    await prisma.school.delete({ where: { id: otherSchoolId } });
    await app.close();
  });

  it('returns a paginated list for a manager', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/students')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(
      Array.isArray((res.body as PaginatedResult<StudentResponseDto>).items),
    ).toBe(true);
  });

  it('also allows a teacher to list students', async () => {
    await request(app.getHttpServer())
      .get('/v1/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);
  });

  it('rejects an unauthenticated request', async () => {
    await request(app.getHttpServer()).get('/v1/students').expect(401);
  });

  it('filters by classId', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/students?classId=${classId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    const body = res.body as PaginatedResult<StudentResponseDto>;

    expect(body.items.length).toBeGreaterThan(0);
    for (const item of body.items) {
      expect(item.classId).toBe(classId);
    }
  });

  it('fetches a student by id', async () => {
    const list = await request(app.getHttpServer())
      .get('/v1/students')
      .set('Authorization', `Bearer ${managerToken}`);
    const studentId = (list.body as PaginatedResult<StudentResponseDto>)
      .items[0].id;

    const res = await request(app.getHttpServer())
      .get(`/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);

    expect((res.body as StudentResponseDto).id).toBe(studentId);
  });

  it('returns a mapped 404 for an unknown id', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/students/does-not-exist')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(404);

    expect((res.body as ErrorResponseBody).errorCode).toBe('STUDENT_NOT_FOUND');
  });

  it('returns 404 for a student belonging to another school', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/students/${otherStudentId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(404);

    expect((res.body as ErrorResponseBody).errorCode).toBe('STUDENT_NOT_FOUND');
  });

  it('never includes another school in the list results', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/students?limit=100')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    const body = res.body as PaginatedResult<StudentResponseDto>;

    expect(body.items.some((item) => item.id === otherStudentId)).toBe(false);
  });

  it('rejects a limit above the max', async () => {
    await request(app.getHttpServer())
      .get('/v1/students?limit=101')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(400);
  });

  it('serves the second identical request from cache without hitting the repository', async () => {
    const repository = app.get<IStudentRepository>(STUDENT_REPOSITORY);
    const spy = jest.spyOn(repository, 'findMany');
    spy.mockClear();

    await request(app.getHttpServer())
      .get('/v1/students?page=1&limit=5')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/v1/students?page=1&limit=5')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
