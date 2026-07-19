import type { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import type { AppException } from '../exceptions/app.exception';

export async function withServiceError<T>(
  fn: () => Promise<T>,
  {
    logger,
    notFound,
    errorContext,
  }: {
    logger: Logger;
    notFound?: {
      ExceptionClass: new (...args: never[]) => AppException;
      warnContext: Record<string, unknown>;
    };
    errorContext: Record<string, unknown>;
  },
): Promise<T> {
  const message =
    typeof errorContext.msg === 'string' ? errorContext.msg : 'service call';
  Sentry.addBreadcrumb({
    category: 'service',
    message,
    level: 'info',
    data: errorContext,
  });
  try {
    return await fn();
  } catch (err: unknown) {
    if (notFound && err instanceof notFound.ExceptionClass) {
      logger.warn(notFound.warnContext);
      throw err;
    }
    logger.error({ ...errorContext, err });
    throw err; // rethrown for AllExceptionsFilter
  }
}
