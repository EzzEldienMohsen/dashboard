import { HttpException } from '@nestjs/common';

export abstract class AppException extends HttpException {
  abstract readonly errorCode: string;
}
