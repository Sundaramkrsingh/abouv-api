import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ZodError, ZodIssue } from 'zod';

const formatZodIssue = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join('.');

  return `${pathString}: ${message}`;
};

const formatZodError = (error: ZodError): string[] => {
  const { issues } = error;

  if (issues.length) {
    return issues.map((issue) => formatZodIssue(issue));
  }

  return ['Unknown Zod validation error'];
};

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = HttpStatus.BAD_REQUEST;

    response.status(status).json({
      success: false,
      statusCode: status,
      error: {
        message: 'Validation failed',
        details: exception.errors,
        formattedErrors: formatZodError(exception), // Return all formatted error messages
      },
    });
  }
}
