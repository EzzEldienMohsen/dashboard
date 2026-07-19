import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { PinoLogger } from 'nestjs-pino';
import * as Sentry from '@sentry/nestjs';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { SchoolNotFoundException } from '../exceptions/school-not-found.exception';

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
}));

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: jest.Mocked<Pick<PinoLogger, 'error' | 'warn'>>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let host: {
    switchToHttp: () => {
      getRequest: () => unknown;
      getResponse: () => unknown;
    };
  };

  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    logger = { error: jest.fn(), warn: jest.fn() };
    filter = new AllExceptionsFilter(logger as unknown as PinoLogger);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    const request = {
      id: 'req-1',
      url: '/schools/missing',
      method: 'GET',
      headers: {},
    };
    const response = { status: statusMock };

    host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('maps an AppException to its status, errorCode, and message, and logs a warning', () => {
    const exception = new SchoolNotFoundException('school-1');

    filter.catch(exception, host as never);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        errorCode: 'SCHOOL_NOT_FOUND',
        message: 'School with id school-1 was not found',
      }),
    );
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('extracts the per-field message array from a ValidationPipe BadRequestException', () => {
    const exception = new BadRequestException([
      'email must be valid',
      'password too short',
    ]);

    filter.catch(exception, host as never);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['email must be valid', 'password too short'],
        errorCode: undefined,
      }),
    );
  });

  it('logs and reports a plain HttpException 404 as a warning without Sentry', () => {
    const exception = new NotFoundException('nope');

    filter.catch(exception, host as never);

    expect(logger.warn).toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('treats a non-HttpException as a 500, logs an error, and reports to Sentry', () => {
    process.env.NODE_ENV = 'development';
    const exception = new Error('connection lost');

    filter.catch(exception, host as never);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(logger.error).toHaveBeenCalled();

    const captureExceptionMock = jest.mocked(Sentry.captureException);
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [capturedException, hint] = captureExceptionMock.mock.calls[0];
    expect(capturedException).toBe(exception);
    expect(hint).toMatchObject({ extra: expect.any(Object) as object });

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
  });

  it('masks a 5xx HttpException message in production but keeps it in non-production', () => {
    const make5xx = () =>
      new HttpException(
        'leaky stack trace detail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    process.env.NODE_ENV = 'production';
    filter.catch(make5xx(), host as never);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );

    jest.clearAllMocks();

    process.env.NODE_ENV = 'development';
    filter.catch(make5xx(), host as never);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'leaky stack trace detail' }),
    );
  });
});
