import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { redisConfig } from '../config/redis.config';

@Injectable()
export class RateLimitMiddleware implements CanActivate {
  private readonly redis = new Redis(redisConfig());

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = `rl:${request.ip}:${request.url}`;
    try {
      const count = await this.redis.incr(key);
      if (count === 1) await this.redis.expire(key, 60);
      if (count > 120) throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    } catch (error) {
      if (error instanceof HttpException) throw error;
    }
    return true;
  }
}
