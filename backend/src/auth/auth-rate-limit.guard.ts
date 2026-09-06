import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  AUTH_RATE_LIMIT_MESSAGE,
  AuthRateLimiter,
} from './auth-rate-limiter.js';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  private readonly limiter = new AuthRateLimiter();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.ip ?? request.socket?.remoteAddress ?? 'unknown';

    if (!this.limiter.consume(key)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: AUTH_RATE_LIMIT_MESSAGE,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
