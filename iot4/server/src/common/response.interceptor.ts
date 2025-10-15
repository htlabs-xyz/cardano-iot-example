import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { format } from 'date-fns';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export const RESPONSE_MESSAGE_METADATA = 'responseMessage';

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_METADATA, message);

export class ApiResponseModel<T> {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: '/api/...' })
  path: string;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ example: '...' })
  data: T;

  @ApiProperty({ example: new Date() })
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseModel<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseModel<T>> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let topLevelMessage = exception.message || 'Unknown error';
    let data: any = [];

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const { statusCode, message } = exceptionResponse as any;
      status = statusCode || status;

      if (Array.isArray(message) && message.length > 0) {
        topLevelMessage = message[0] || topLevelMessage;
        data = message;
      }
    }

    response.status(status).json({
      status: false,
      statusCode: status,
      path: request.url,
      message: topLevelMessage,
      data: data,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;
    const message =
      this.reflector.get<string>(
        RESPONSE_MESSAGE_METADATA,
        context.getHandler(),
      ) || 'success';

    return {
      status: true,
      path: request.url,
      message: message,
      statusCode,
      data: res,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    };
  }
}
