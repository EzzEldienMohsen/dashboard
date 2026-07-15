import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const DB_POOL_SIZE = Number(process.env.DB_POOL_SIZE ?? 10);
const DB_POOL_IDLE_TIMEOUT_MS = Number(
  process.env.DB_POOL_IDLE_TIMEOUT_MS ?? 30_000,
);
const DB_POOL_CONNECTION_TIMEOUT_MS = Number(
  process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 5_000,
);
const SLOW_QUERY_THRESHOLD_MS = Number(
  process.env.SLOW_QUERY_THRESHOLD_MS ?? 200,
);

interface PrismaQueryEvent {
  query: string;
  duration: number;
}

/**
 * The generated client's `$on('query', ...)` overload is only typed when the
 * `log` option's LogOpts generic is threaded through a class `extends` clause,
 * which the Prisma 7 driver-adapter codegen doesn't support cleanly for
 * subclasses. The listener genuinely exists at runtime because `log` includes
 * a `query`/`event` entry below — this narrow interface just names its shape.
 */
interface PrismaClientWithQueryEvents {
  $on(eventType: 'query', callback: (event: PrismaQueryEvent) => void): void;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: DB_POOL_SIZE,
        idleTimeoutMillis: DB_POOL_IDLE_TIMEOUT_MS,
        connectionTimeoutMillis: DB_POOL_CONNECTION_TIMEOUT_MS,
      }),
      log:
        process.env.NODE_ENV !== 'production'
          ? [{ level: 'query', emit: 'event' }]
          : [],
    });
  }

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      (this as unknown as PrismaClientWithQueryEvents).$on('query', (event) => {
        if (event.duration >= SLOW_QUERY_THRESHOLD_MS) {
          this.logger.warn({
            msg: 'slow query detected',
            durationMs: event.duration,
            query: event.query,
          });
        }
      });
    }

    await this.$connect();
    this.logger.log(
      `Prisma connected (pool size ${DB_POOL_SIZE}, idle timeout ${DB_POOL_IDLE_TIMEOUT_MS}ms)`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
