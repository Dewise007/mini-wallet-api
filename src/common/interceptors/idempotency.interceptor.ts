import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Request } from 'express';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.constants';

const IDEMPOTENCY_TTL_SECONDS = 60 * 60; // 1 hour

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.header('Idempotency-Key');

    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    return from(
      this.redis.set(
        redisKey,
        'processing',
        'EX',
        IDEMPOTENCY_TTL_SECONDS,
        'NX',
      ),
    ).pipe(
      switchMap((result) => {
        if (result === null) {
          // Key already exists — this is a retry. Return the stored response.
          return from(this.redis.get(redisKey)).pipe(
            switchMap((stored) => {
              if (stored && stored !== 'processing') {
                return of(JSON.parse(stored));
              }
              throw new BadRequestException(
                'Duplicate request is already being processed',
              );
            }),
          );
        }

        // We claimed the key — proceed with the real request, then store the result
        return next.handle().pipe(
          tap((response) => {
            void this.redis.set(
              redisKey,
              JSON.stringify(response),
              'EX',
              IDEMPOTENCY_TTL_SECONDS,
            );
          }),
        );
      }),
    );
  }
}
