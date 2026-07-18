import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditEventPayload } from './event-queue.service';
import { EVENTS_QUEUE } from './queues.constants';

@Processor(EVENTS_QUEUE)
export class AuditEventProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditEventProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<AuditEventPayload>): Promise<void> {
    if (job.name === 'audit') {
      const { userId, action, resourceType, resourceId, timestamp } = job.data;
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resourceType,
          resourceId,
          timestamp: new Date(timestamp),
        },
      });
      this.logger.log({ msg: 'audit event persisted', ...job.data });
    }
  }
}
