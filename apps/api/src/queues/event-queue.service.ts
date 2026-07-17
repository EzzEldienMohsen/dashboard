import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EVENTS_QUEUE } from './queues.constants';

export interface AuditEventPayload {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}

@Injectable()
export class EventQueueService {
  constructor(@InjectQueue(EVENTS_QUEUE) private readonly queue: Queue) {}

  queueAuditEvent(payload: AuditEventPayload): Promise<void> {
    return this.queue
      .add('audit', payload, { removeOnComplete: 100 })
      .then(() => undefined);
  }
}
