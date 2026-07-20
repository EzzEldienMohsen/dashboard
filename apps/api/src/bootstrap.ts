import { join } from 'node:path';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/**
 * Builds and fully configures the Nest app (middleware, versioning,
 * validation, Swagger) but does NOT call `.listen()`. Shared by:
 *  - `main.ts` (local/Docker): calls `.listen(PORT)` afterwards.
 *  - `api/index.js` (Vercel): calls `.init()` afterwards and reuses the
 *    underlying Express instance as the request handler.
 */
export async function createNestApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  // Falling back to `true` (reflect any Origin) combined with credentials
  // would allow any site to make authenticated requests if CORS_ORIGIN is
  // ever left unset in production — permissive in dev for convenience,
  // fail closed (deny all cross-origin) in production instead.
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : process.env.NODE_ENV !== 'production',
    credentials: true,
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('School Dashboard API')
      .setDescription('School / Class / Student management API')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument, {
    // Served from a copy inside dist/ (populated by
    // scripts/copy-swagger-ui-assets.js at build time) rather than directly
    // from node_modules/swagger-ui-dist — one predictable, includable
    // location for these static assets across local/Docker/Vercel.
    customSwaggerUiPath: join(__dirname, '..', 'swagger-ui-assets'),
  });

  return app;
}
