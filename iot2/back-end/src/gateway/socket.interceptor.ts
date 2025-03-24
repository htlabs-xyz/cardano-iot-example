import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { format } from 'date-fns';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ApiResponseModel,
  RESPONSE_MESSAGE_METADATA,
} from '../common/response.interceptor';
import { EVENT_NAME_KEY } from './socket.decorator';

@Injectable()
export class ResponseWsInterceptor<T>
  implements NestInterceptor<T, ApiResponseModel<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseModel<T>> {
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: WsException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  errorHandler(
    exception: WsException | HttpException,
    context: ExecutionContext,
  ) {
    const ctx = context.switchToWs();
    const client = ctx.getClient();
    const data = ctx.getData();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let topLevelMessage = exception.message || 'Unknown error'; // Sử dụng message của WsException
    let responseData: any = [];

    // Lấy thông tin lỗi từ WsException
    if (exception instanceof WsException) {
      // Handle WsException
      const exceptionResponse = exception.getError();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const { statusCode, message } = exceptionResponse as any;
        status = statusCode || status;
        if (Array.isArray(message) && message.length > 0) {
          topLevelMessage = message[0] || topLevelMessage;
          responseData = message;
        }
      }
    } else if (exception instanceof HttpException) {
      // Handle HttpException
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const { statusCode, message } = exceptionResponse as any;
        status = statusCode || status;
        if (Array.isArray(message) && message.length > 0) {
          topLevelMessage = message[0] || topLevelMessage;
          responseData = message;
        }
      }
    }

    // Gửi lỗi về client WebSocket
    const eventName =
      this.reflector.get<string>(EVENT_NAME_KEY, context.getHandler()) ||
      'defaultEvent';
    client.emit(eventName, {
      status: false,
      statusCode: status,
      path: data?.url || '', // Dữ liệu URL nếu có
      message: topLevelMessage,
      data: responseData,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    });
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToWs();
    const data = ctx.getData();

    const statusCode = 200; // Đặt statusCode mặc định, nếu có thể lấy từ response có sẵn
    const message =
      this.reflector.get<string>(
        RESPONSE_MESSAGE_METADATA,
        context.getHandler(),
      ) || 'success'; // Lấy thông điệp metadata
    // client.emit('onUpdatedTemperature', {
    //     status: true,
    //     path: data?.url || '',
    //     message: message,
    //     statusCode,
    //     data: res,
    //     timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    // });
    return {
      status: true,
      path: data?.url || '',
      message: message,
      statusCode,
      data: res,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    };
  }
}
