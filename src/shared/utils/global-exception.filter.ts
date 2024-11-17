import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    let error =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal Server Error', details: exception.toString() };

    if (typeof error === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { statusCode, ...rest } = error as {
        statusCode: number;
      };

      error = rest;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
    });
  }
}
