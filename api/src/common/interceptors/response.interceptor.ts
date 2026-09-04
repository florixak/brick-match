import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '@brick-match/shared-types';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ url: string }>();
    if (req.url.startsWith('/health')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: T) => {
        if (data === undefined) {
          return data;
        }

        if (this.isApiSuccessResponse(data)) {
          return data;
        }

        return { data, meta: {} };
      }),
    );
  }

  private isApiSuccessResponse(
    value: unknown,
  ): value is ApiSuccessResponse<unknown> {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    if (!('data' in value) || !('meta' in value)) {
      return false;
    }

    const { meta } = value as { meta: unknown };
    return meta !== null && typeof meta === 'object' && !Array.isArray(meta);
  }
}
