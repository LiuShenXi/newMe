import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RequestWithId {
  requestId?: string;
}

interface JsonResponse {
  status(code: number): {
    json(payload: unknown): void;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<JsonResponse>();
    const request = context.getRequest<RequestWithId>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    response.status(status).json({
      code: this.resolveCode(status, payload),
      message: this.resolveMessage(status, payload),
      requestId: request.requestId ?? 'req_unknown',
    });
  }

  private resolveCode(status: number, payload: unknown) {
    if (this.isObjectPayload(payload) && typeof payload.code === 'string') {
      return payload.code;
    }

    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'INTERNAL_SERVER_ERROR'
      : `HTTP_${status}`;
  }

  private resolveMessage(status: number, payload: unknown) {
    if (this.isObjectPayload(payload) && typeof payload.message === 'string') {
      return payload.message;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? '服务暂时不可用，请稍后再试'
      : '请求处理失败';
  }

  private isObjectPayload(payload: unknown): payload is Record<string, unknown> {
    return typeof payload === 'object' && payload !== null;
  }
}
