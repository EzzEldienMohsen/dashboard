import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';
import { AppException } from '../exceptions/app.exception';

interface ErrorBreadcrumb {
  requestId: string | undefined;
  path: string;
  method: string;
  timestamp: string;
}

const SERVER_ERROR_STATUS: number = HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * class-validator's ValidationPipe throws a BadRequestException whose getResponse()
 * carries the per-field messages (string[]); exception.message alone is just "Bad Request Exception".
 */
function extractMessage(exception: HttpException): string | string[] {
  const body = exception.getResponse();
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const candidate = body.message;
    if (typeof candidate === 'string' || Array.isArray(candidate)) {
      return candidate as string | string[];
    }
  }
  return exception.message;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(AllExceptionsFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { id?: string }>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status: number = isHttpException
      ? exception.getStatus()
      : SERVER_ERROR_STATUS;
    const errorCode =
      exception instanceof AppException ? exception.errorCode : undefined;
    const message = isHttpException
      ? extractMessage(exception)
      : 'Internal server error';

    const breadcrumb: ErrorBreadcrumb = {
      requestId:
        request.id ?? (request.headers['x-request-id'] as string | undefined),
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (status >= SERVER_ERROR_STATUS) {
      this.logger.error(
        { err: exception, ...breadcrumb },
        'Unhandled exception',
      );
      Sentry.captureException(exception, { extra: { ...breadcrumb } });
    } else {
      const logMessage = Array.isArray(message) ? message.join('; ') : message;
      this.logger.warn({ ...breadcrumb, status, errorCode }, logMessage);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    response.status(status).json({
      statusCode: status,
      message:
        isProduction && status >= SERVER_ERROR_STATUS
          ? 'Internal server error'
          : message,
      errorCode,
      ...breadcrumb,
    });
  }
}
