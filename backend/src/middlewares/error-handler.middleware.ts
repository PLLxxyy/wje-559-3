import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class BusinessException extends HttpException {
  constructor(message: string, public readonly errorCode: string, status = HttpStatus.BAD_REQUEST, public readonly code = 40001) {
    super(message, status);
  }
}

@Catch()
export class ErrorHandlerMiddleware implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorCode = exception instanceof BusinessException ? exception.errorCode : exception instanceof HttpException ? exception.name : 'INTERNAL_ERROR';
    const message = exception instanceof HttpException ? String(exception.message) : 'Internal server error';

    response.status(status).json({
      code: exception instanceof BusinessException ? exception.code : status * 100,
      message,
      error: errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
