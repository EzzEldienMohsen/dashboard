import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EventQueueService } from './event-queue.service';
import { AuditEventProcessor } from './audit-event.processor';
import { EVENTS_QUEUE } from './queues.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get<string>('REDIS_URL') },
      }),
    }),
    BullModule.registerQueue({ name: EVENTS_QUEUE }),
  ],
  providers: [EventQueueService, AuditEventProcessor],
  exports: [BullModule, EventQueueService],
})
export class QueuesModule {}
