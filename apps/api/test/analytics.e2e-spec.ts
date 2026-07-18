import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type ErrorResponseBody } from './create-test-app';
import {
  ANALYTICS_REPOSITORY,
  type IAnalyticsRepository,
} from './../src/analytics/interfaces/analytics-repository.interface';
import type { AnalyticsResponseDto } from './../src/analytics/dto/analytics-response.dto';
import type { SchoolResponseDto } from './../src/schools/dto/school-response.dto';
import type { AuthResponseDto } from './../src/auth/dto/auth-response.dto';
import type { PaginatedResult } from './../src/common/interfaces/paginated-result.interface';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication<App>;
  let managerToken: string;
  let teacherToken: string;
  let schoolId: string;
  let prisma: PrismaService;
  let otherSchoolId: string;
  let otherClassId: string;
  let fixtureClassId: string;
  let fixtureStudentId: string;

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

    const schools = await request(app.getHttpServer())
      .get('/v1/schools')
      .set('Authorization', `Bearer ${managerToken}`);
    schoolId = (schools.body as PaginatedResult<SchoolResponseDto>).items[0].id;

    otherSchoolId = randomUUID();
    await prisma.school.create({
      data: { id: otherSchoolId, name: 'Other School (e2e fixture)' },
    });
    otherClassId = randomUUID();
    await prisma.class.create({
      data: {
        id: otherClassId,
        name: 'Other School Class',
        schoolId: otherSchoolId,
      },
    });

    // Fresh, isolated class + student so class-scoped analytics are
    // exactly predictable (the seeded demo data uses random Faker values,
    // so only a brand-new class with no pre-existing records is safe to
    // assert exact percentages against).
    fixtureClassId = randomUUID();
    await prisma.class.create({
      data: { id: fixtureClassId, name: 'Analytics Fixture Class', schoolId },
    });
    fixtureStudentId = randomUUID();
    await prisma.student.create({
      data: {
        id: fixtureStudentId,
        firstName: 'Fixture',
        lastName: 'Student',
        classId: fixtureClassId,
      },
    });
    await prisma.attendanceRecord.createMany({
      data: [
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-05'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-06'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-07'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-08'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-09'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-12'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-13'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-14'),
          status: 'PRESENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-15'),
          status: 'ABSENT',
        },
        {
          studentId: fixtureStudentId,
          date: new Date('2026-01-16'),
          status: 'LATE',
        },
      ],
    });
    await prisma.gradeRecord.createMany({
      data: [
        {
          studentId: fixtureStudentId,
          subject: 'Math',
          score: 80,
          maxScore: 100,
          recordedAt: new Date('2026-01-10'),
        },
        {
          studentId: fixtureStudentId,
          subject: 'Math',
          score: 90,
          maxScore: 100,
          recordedAt: new Date('2026-01-11'),
        },
        {
          studentId: fixtureStudentId,
          subject: 'Science',
          score: 70,
          maxScore: 100,
          recordedAt: new Date('2026-01-10'),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.school.delete({ where: { id: otherSchoolId } });
    await prisma.class.delete({ where: { id: fixtureClassId } });
    await app.close();
  });

  describe('GET /v1/schools/:id/analytics', () => {
    it('returns a well-shaped snapshot for a manager', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/schools/${schoolId}/analytics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
      const body = res.body as AnalyticsResponseDto;

      expect(body.attendanceRatePercentage).toBeGreaterThanOrEqual(0);
      expect(body.attendanceRatePercentage).toBeLessThanOrEqual(100);
      expect(typeof body.attendanceBreakdown.present).toBe('number');
      expect(typeof body.attendanceBreakdown.absent).toBe('number');
      expect(typeof body.attendanceBreakdown.late).toBe('number');
      expect(typeof body.attendanceBreakdown.excused).toBe('number');
      expect(body.averageGradePercentage).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(body.gradesBySubject)).toBe(true);
    });

    it('rejects a teacher (manager-only)', async () => {
      await request(app.getHttpServer())
        .get(`/v1/schools/${schoolId}/analytics`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('rejects an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get(`/v1/schools/${schoolId}/analytics`)
        .expect(401);
    });

    it('returns 404 for another school', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/schools/${otherSchoolId}/analytics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(404);

      expect((res.body as ErrorResponseBody).errorCode).toBe(
        'SCHOOL_NOT_FOUND',
      );
    });
  });

  describe('GET /v1/classes/:id/analytics', () => {
    // Runs first, deliberately: it needs the very first request to this
    // URL to be an actual cache miss. Later tests in this block re-request
    // the same URL, which would otherwise warm the cache before this runs.
    it('serves the second identical request from cache without hitting the repository', async () => {
      const repository = app.get<IAnalyticsRepository>(ANALYTICS_REPOSITORY);
      const spy = jest.spyOn(repository, 'getSnapshotForClass');
      spy.mockClear();

      await request(app.getHttpServer())
        .get(`/v1/classes/${fixtureClassId}/analytics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/v1/classes/${fixtureClassId}/analytics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('returns exact percentages computed from the fixture records', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/classes/${fixtureClassId}/analytics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
      const body = res.body as AnalyticsResponseDto;

      // 8 PRESENT / 10 total = 80%
      expect(body.attendanceRatePercentage).toBe(80);
      expect(body.attendanceBreakdown).toEqual({
        present: 8,
        absent: 1,
        late: 1,
        excused: 0,
      });
      // avg(score)=80, avg(maxScore)=100 -> 80%
      expect(body.averageGradePercentage).toBe(80);
      expect(body.gradesBySubject).toEqual(
        expect.arrayContaining([
          { subject: 'Math', averagePercentage: 85 },
          { subject: 'Science', averagePercentage: 70 },
        ]),
      );
    });

    it('also allows a teacher', async () => {
      await request(app.getHttpServer())
        .get(`/v1/classes/${fixtureClassId}/analytics`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
    });

    it('rejects an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get(`/v1/classes/${fixtureClassId}/analytics`)
        .expect(401);
    });

    it('returns 404 for a class belonging to another school', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/classes/${otherClassId}/analytics`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(404);

      expect((res.body as ErrorResponseBody).errorCode).toBe('CLASS_NOT_FOUND');
    });
  });
});
