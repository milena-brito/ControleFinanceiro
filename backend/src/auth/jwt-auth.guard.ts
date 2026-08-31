import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from './auth.constants.js';
import type { JwtPayload } from './auth.types.js';

export type AuthenticatedRequest = Request & {
  user: { id: string; email: string };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.readToken(request);

    if (!token) {
      throw new UnauthorizedException('Faça login para continuar.');
    }

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      request.user = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('Faça login para continuar.');
    }
  }

  private readToken(request: AuthenticatedRequest): string | undefined {
    const fromCookie = request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (typeof fromCookie === 'string' && fromCookie.length > 0) {
      return fromCookie;
    }

    const header = request.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }

    return undefined;
  }
}
