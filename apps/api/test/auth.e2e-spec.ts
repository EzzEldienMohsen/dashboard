import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, type ErrorResponseBody } from './create-test-app';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from './../src/users/interfaces/user-repository.interface';
import type { AuthResponseDto } from './../src/auth/dto/auth-response.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    it('creates a new user and returns an access token', async () => {
      const email = `e2e-test-${Date.now()}@example.com`;

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          role: 'TEACHER',
          name: 'E2E Test User',
          email,
          phone: '+1-555-0199',
          country: 'United States',
          password: 'Passw0rd!',
          confirmPassword: 'Passw0rd!',
        })
        .expect(201);
      const body = res.body as AuthResponseDto;

      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.user.email).toBe(email);
      expect(
        (body.user as unknown as Record<string, unknown>).passwordHash,
      ).toBeUndefined();
    });

    it('rejects a duplicate email with 409', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          role: 'TEACHER',
          name: 'Duplicate User',
          email: 'manager@schooldashboard.dev',
          phone: '+1-555-0199',
          country: 'United States',
          password: 'Passw0rd!',
          confirmPassword: 'Passw0rd!',
        })
        .expect(409);

      expect((res.body as ErrorResponseBody).errorCode).toBe(
        'EMAIL_ALREADY_EXISTS',
      );
    });

    it('rejects a mismatched confirmPassword with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          role: 'TEACHER',
          name: 'Mismatch User',
          email: `e2e-mismatch-${Date.now()}@example.com`,
          phone: '+1-555-0199',
          country: 'United States',
          password: 'Passw0rd!',
          confirmPassword: 'SomethingElse1!',
        })
        .expect(400);
    });
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'manager@schooldashboard.dev',
          password: 'Password123!',
        })
        .expect(200);

      expect((res.body as AuthResponseDto).accessToken).toEqual(
        expect.any(String),
      );
    });

    it('rejects an unknown email with 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@schooldashboard.dev', password: 'Password123!' })
        .expect(401);

      expect((res.body as ErrorResponseBody).errorCode).toBe(
        'INVALID_CREDENTIALS',
      );
    });

    it('rejects a wrong password with 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'manager@schooldashboard.dev',
          password: 'WrongPassword1!',
        })
        .expect(401);

      expect((res.body as ErrorResponseBody).errorCode).toBe(
        'INVALID_CREDENTIALS',
      );
    });
  });

  describe('authenticated request caching', () => {
    it('resolves the JWT user from cache on the second request, skipping the repository', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'manager@schooldashboard.dev',
          password: 'Password123!',
        });
      const token = (login.body as AuthResponseDto).accessToken;

      const repository = app.get<IUserRepository>(USER_REPOSITORY);
      const spy = jest.spyOn(repository, 'findById');
      spy.mockClear();

      await request(app.getHttpServer())
        .get('/schools')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      await request(app.getHttpServer())
        .get('/schools')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });
});
