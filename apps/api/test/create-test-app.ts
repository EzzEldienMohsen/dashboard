import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

/** Shape of the JSON body AllExceptionsFilter emits for non-2xx responses. */
export interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  errorCode?: string;
}

/**
 * e2e specs boot the app via `createNestApplication()` directly, which never runs
 * `main.ts`'s `bootstrap()` — so the global ValidationPipe/ClassSerializerInterceptor
 * set up there must be replicated here or DTO validation silently no-ops in tests.
 */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();
  return app;
}
