process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://user:pass@localhost:5432/testdb';

import { Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface QueryEventListener {
  $on(
    eventType: 'query',
    callback: (event: { query: string; duration: number }) => void,
  ): void;
}

describe('PrismaService', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('connects to the database on module init', async () => {
    const service = new PrismaService();
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledWith();
  });

  it('disconnects from the database on module destroy', async () => {
    const service = new PrismaService();
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledWith();
  });

  it('registers a slow-query listener outside production and warns above the threshold', async () => {
    process.env.NODE_ENV = 'development';
    const service = new PrismaService();
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    const onSpy = jest.spyOn(service as unknown as QueryEventListener, '$on');
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    await service.onModuleInit();

    expect(onSpy).toHaveBeenCalledWith('query', expect.any(Function));
    const [, callback] = onSpy.mock.calls[0];

    callback({ query: 'SELECT 1', duration: 5 });
    expect(warnSpy).not.toHaveBeenCalled();

    callback({ query: 'SELECT * FROM student', duration: 999 });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({ msg: 'slow query detected', durationMs: 999 }),
    );

    warnSpy.mockRestore();
  });

  it('does not register a slow-query listener in production', async () => {
    process.env.NODE_ENV = 'production';
    const service = new PrismaService();
    jest.spyOn(service, '$connect').mockResolvedValue(undefined);
    const onSpy = jest.spyOn(service as unknown as QueryEventListener, '$on');

    await service.onModuleInit();

    expect(onSpy).not.toHaveBeenCalled();
  });
});
