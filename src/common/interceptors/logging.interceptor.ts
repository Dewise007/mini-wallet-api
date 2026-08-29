import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.write(request, response.statusCode, startedAt),
        error: (err: unknown) =>
          this.write(
            request,
            err instanceof HttpException ? err.getStatus() : 500,
            startedAt,
          ),
      }),
    );
  }

  private write(request: Request, status: number, startedAt: number) {
    const line = `${request.method} ${request.originalUrl} ${status} ${Date.now() - startedAt}ms`;

    if (status >= 500) {
      this.logger.error(line);
      return;
    }

    this.logger.log(line);
  }
}
