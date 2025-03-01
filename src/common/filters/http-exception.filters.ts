import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // if error is HttpException
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;  // 500

    // message of error
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Unexpected error occurred.';
    
      // stack trace of error
    const stack = exception instanceof Error ? exception.stack : null;

    // line of error
    const lineNumber = stack ? stack.split('\n')[1].trim() : 'Unknown';

    // response of error
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      errorLocation: lineNumber, 
      stack: stack 
    });
  }
}