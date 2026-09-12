import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class DistributedLockService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Attempts to acquire a lock. Returns a lock token if successful, or null if
   * someone else already holds the lock.
   */
  async acquire(key: string, ttlMs: number): Promise<string | null> {
    const token = randomUUID();
    const lockKey = `lock:${key}`;

    const result = await this.redis.set(lockKey, token, 'PX', ttlMs, 'NX');

    return result === 'OK' ? token : null;
  }

  /**
   * Releases a lock, but only if the token matches what we set — this
   * prevents releasing a lock that someone else acquired after ours expired.
   */
  async release(key: string, token: string): Promise<void> {
    const lockKey = `lock:${key}`;

    // Lua script makes the "check token, then delete" step atomic
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    await this.redis.eval(script, 1, lockKey, token);
  }
}
