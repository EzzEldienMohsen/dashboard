import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  type HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { CacheHealthIndicator } from './cache-health.indicator';

// Public liveness/readiness probe for orchestrators — no auth/role guards by design.
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly cacheIndicator: CacheHealthIndicator,
  ) {}

  // Version-neutral: monitoring/orchestrators expect a stable /health path, not /v1/health.
  // @Version() must be method-level here — like @Header(), applying it at the class level
  // crashes at module-load time ("Cannot read properties of undefined (reading 'value')").
  @Get()
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
      () => this.cacheIndicator.isHealthy('cache'),
    ]);
  }
}
