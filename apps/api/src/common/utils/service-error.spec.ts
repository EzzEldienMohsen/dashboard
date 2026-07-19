import type { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { withServiceError } from './service-error';
import { NotFoundAppException } from '../exceptions/not-found-app.exception';

jest.mock('@sentry/nestjs', () => ({
  addBreadcrumb: jest.fn(),
}));

class TestNotFoundException extends NotFoundAppException {
  readonly errorCode = 'TEST_NOT_FOUND';

  constructor(id: string) {
    super('Thing', id);
  }
}

describe('withServiceError', () => {
  let logger: jest.Mocked<Pick<Logger, 'warn' | 'error'>>;

  beforeEach(() => {
    logger = { warn: jest.fn(), error: jest.fn() };
    jest.clearAllMocks();
  });

  it('adds a Sentry breadcrumb with the error context before running the operation', async () => {
    await withServiceError(() => Promise.resolve('ok'), {
      logger: logger as unknown as Logger,
      errorContext: { msg: 'doing thing', schoolId: 'school-1' },
    });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'service',
        message: 'doing thing',
        level: 'info',
        data: { msg: 'doing thing', schoolId: 'school-1' },
      }),
    );
  });

  it('returns the resolved value on success', async () => {
    const result = await withServiceError(() => Promise.resolve('ok'), {
      logger: logger as unknown as Logger,
      errorContext: { msg: 'doing thing' },
    });

    expect(result).toBe('ok');
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('warns and rethrows without logging an error when the expected not-found exception is thrown', async () => {
    const exception = new TestNotFoundException('id-1');

    await expect(
      withServiceError(() => Promise.reject(exception), {
        logger: logger as unknown as Logger,
        notFound: {
          ExceptionClass: TestNotFoundException,
          warnContext: { msg: 'not found' },
        },
        errorContext: { msg: 'failed' },
      }),
    ).rejects.toBe(exception);

    expect(logger.warn).toHaveBeenCalledWith({ msg: 'not found' });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs an error and rethrows unexpected errors', async () => {
    const error = new Error('connection lost');

    await expect(
      withServiceError(() => Promise.reject(error), {
        logger: logger as unknown as Logger,
        errorContext: { msg: 'failed' },
      }),
    ).rejects.toBe(error);

    expect(logger.error).toHaveBeenCalledWith({ msg: 'failed', err: error });
  });
});
