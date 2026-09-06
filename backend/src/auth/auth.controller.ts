import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { ACCESS_TOKEN_COOKIE } from './auth.constants.js';
import { AuthRateLimitGuard } from './auth-rate-limit.guard.js';
import { AuthService } from './auth.service.js';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from './auth.schema.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(AuthRateLimitGuard)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(body);
    this.setAccessCookie(response, result.accessToken);
    return { user: result.user };
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(AuthRateLimitGuard)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(body);
    this.setAccessCookie(response, result.accessToken);
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    const options = accessCookieOptions();
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: options.httpOnly,
      sameSite: options.sameSite,
      secure: options.secure,
      path: options.path,
    });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { id: string; email: string }) {
    return this.authService.getProfile(user.id);
  }

  private setAccessCookie(response: Response, token: string): void {
    response.cookie(ACCESS_TOKEN_COOKIE, token, accessCookieOptions());
  }
}

function accessCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS_MS,
  };
}
