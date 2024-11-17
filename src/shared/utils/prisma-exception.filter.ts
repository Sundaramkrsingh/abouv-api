import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError, PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: PrismaClientKnownRequestError | PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse();
    // Set the status code to 400 for client errors
    const statusCode = HttpStatus.BAD_REQUEST;
    // Extracting the last line of the Prisma error message

    const prismaError = exception.message.split('\n').slice(-1)[0].trim();
    //For Reference // To do //need to go in log file after setting logger
    console.log('Prisma exception.message:', exception.message);

    response.status(statusCode).json({
      success: false,
      statusCode,
      error: {
        message:
          exception instanceof PrismaClientKnownRequestError
            ? prismaError
            : {
                message: 'Internal Server Error',
                details: exception.toString(),
              },
      },
    });
  }
}
