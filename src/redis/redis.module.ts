import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DistributedLockService } from './distributed-lock.service';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get<string>('REDIS_HOST'),
          port: Number(config.get<string>('REDIS_PORT')),
        });
      },
    },
    DistributedLockService,
  ],
  exports: [REDIS_CLIENT, DistributedLockService],
})
export class RedisModule {}
