import type { Job } from 'bullmq';
import { AuditEventProcessor } from './audit-event.processor';
import type { AuditEventPayload } from './event-queue.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('AuditEventProcessor', () => {
  const auditLog = { create: jest.fn() };
  const prisma = { auditLog } as unknown as PrismaService;
  let processor: AuditEventProcessor;

  const payload: AuditEventPayload = {
    userId: 'user-1',
    action: 'user.login',
    resourceType: 'User',
    resourceId: 'user-1',
    timestamp: '2026-07-18T10:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    processor = new AuditEventProcessor(prisma);
  });

  it('persists an audit job to the database', async () => {
    auditLog.create.mockResolvedValue(undefined);

    await processor.process({
      name: 'audit',
      data: payload,
    } as Job<AuditEventPayload>);

    expect(auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        action: 'user.login',
        resourceType: 'User',
        resourceId: 'user-1',
        timestamp: new Date(payload.timestamp),
      },
    });
  });

  it('ignores jobs that are not the audit job name', async () => {
    await processor.process({
      name: 'other',
      data: payload,
    } as Job<AuditEventPayload>);

    expect(auditLog.create).not.toHaveBeenCalled();
  });
});
