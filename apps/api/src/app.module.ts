import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './common/config/env.validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { READ_CACHE_TTL_MS } from './common/constants/cache.constant';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './schools/schools.module';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { SchoolProfileModule } from './school-profile/school-profile.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { PublicStatsModule } from './public-stats/public-stats.module';
import { HealthModule } from './health/health.module';

/**
 * The default `cache-manager` store is an in-process Map — correct for a
 * single instance, but each replica sees its own cache once you scale out.
 * Setting REDIS_URL backs the same CacheInterceptor/CACHE_MANAGER usage with
 * a shared Redis store instead, with no other code changes required.
 */
function buildCacheStores(): KeyvRedis<unknown>[] | undefined {
  return process.env.REDIS_URL
    ? [new KeyvRedis(process.env.REDIS_URL)]
    : undefined;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        redact: ['req.headers.authorization'],
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    CacheModule.register({
      isGlobal: true,
      ttl: READ_CACHE_TTL_MS,
      stores: buildCacheStores(),
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    SchoolsModule,
    ClassesModule,
    StudentsModule,
    SchoolProfileModule,
    AnnouncementsModule,
    PublicStatsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
