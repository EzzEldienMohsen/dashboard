import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import type { AuditEventPayload } from './event-queue.service';
import { EVENTS_QUEUE } from './queues.constants';

@Processor(EVENTS_QUEUE)
export class AuditEventProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditEventProcessor.name);

  process(job: Job<AuditEventPayload>): Promise<void> {
    if (job.name === 'audit') {
      this.logger.log({ msg: 'audit event processed', ...job.data });
      // Future: persist to DB audit table, send email notification, etc.
    }
    return Promise.resolve();
  }
}
