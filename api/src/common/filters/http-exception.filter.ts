import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiErrorResponse } from '@lego-matcher/shared-types';
import type { Request, Response } from 'express';

type ExceptionResponseBody = {
  message?: string | string[];
  errors?: Record<string, string[]>;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      if (exception instanceof Error) {
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.error(`Unhandled exception: ${String(exception)}`);
      }
    }

    const responseBody = this.extractResponseBody(exception);

    const body: ApiErrorResponse = {
      statusCode: status,
      message: responseBody.message,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(responseBody.errors ? { errors: responseBody.errors } : {}),
    };

    response.status(status).json(body);
  }

  private extractResponseBody(exception: unknown): {
    message: string;
    errors?: Record<string, string[]>;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return { message: response };
      }
      if (typeof response === 'object' && response !== null) {
        const { message, errors } = response as ExceptionResponseBody;
        return {
          message: this.formatMessage(message),
          errors,
        };
      }
    }

    if (exception instanceof Error) {
      return { message: 'Internal server error' };
    }

    return { message: 'Internal server error' };
  }

  private formatMessage(message: string | string[] | undefined): string {
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    return 'Bad Request';
  }
}
