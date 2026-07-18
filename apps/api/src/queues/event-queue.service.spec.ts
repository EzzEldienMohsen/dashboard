import { getQueueToken } from '@nestjs/bullmq';
import { Test } from '@nestjs/testing';
import {
  EventQueueService,
  type AuditEventPayload,
} from './event-queue.service';
import { EVENTS_QUEUE } from './queues.constants';

describe('EventQueueService', () => {
  let service: EventQueueService;
  const queue = { add: jest.fn() };

  const payload: AuditEventPayload = {
    userId: 'user-1',
    action: 'user.login',
    resourceType: 'User',
    resourceId: 'user-1',
    timestamp: '2026-07-18T10:00:00.000Z',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventQueueService,
        { provide: getQueueToken(EVENTS_QUEUE), useValue: queue },
      ],
    }).compile();

    service = moduleRef.get(EventQueueService);
  });

  it('adds an audit job to the queue with the payload', async () => {
    queue.add.mockResolvedValue(undefined);

    await service.queueAuditEvent(payload);

    expect(queue.add).toHaveBeenCalledWith('audit', payload, {
      removeOnComplete: 100,
    });
  });
});
