import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof ConflictException) {
      status = exception.getStatus();
      message = exception.getResponse()['message'] || 'Conflict';
    }

    response.status(status).json({
      message,
      status,
    });
  }
}
