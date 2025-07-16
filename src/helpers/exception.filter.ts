import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { IResponse } from '../interfaces/generic.interface';

// Exception filter for all modules
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as unknown as object;

    const data: Partial<IResponse> = {
      status: 'fail',
      ...error,
      data: null,
    };

    response.status(status).json(data);
  }
}
