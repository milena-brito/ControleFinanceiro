import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from './http-exception.constants.js';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        response.status(status).json({ statusCode: status, message: payload });
        return;
      }

      response.status(status).json(payload);
      return;
    }

    if (this.isDatabaseUnavailable(exception)) {
      this.logger.error('Falha ao acessar o banco de dados.');
      response.status(503).json({
        statusCode: 503,
        message: DATABASE_UNAVAILABLE_MESSAGE,
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.name : 'Erro inesperado',
    );
    response.status(500).json({
      statusCode: 500,
      message: UNEXPECTED_ERROR_MESSAGE,
    });
  }

  private isDatabaseUnavailable(exception: unknown): boolean {
    return (
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientRustPanicError
    );
  }
}
