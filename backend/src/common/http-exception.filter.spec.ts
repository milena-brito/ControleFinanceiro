import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppExceptionFilter } from './http-exception.filter.js';
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from './http-exception.constants.js';

describe('AppExceptionFilter', () => {
  const filter = new AppExceptionFilter();

  function createHost() {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as ArgumentsHost;

    return { host, status, json };
  }

  it('mantém status e mensagem de HttpException', () => {
    const { host, status, json } = createHost();

    filter.catch(new BadRequestException('Informe a descrição.'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Informe a descrição.',
      }),
    );
  });

  it('não expõe erro interno do Prisma quando o banco está indisponível', () => {
    const { host, status, json } = createHost();
    const error = new Prisma.PrismaClientInitializationError(
      'Environment variable not found: DATABASE_URL.',
      '6.19.3',
    );

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith({
      statusCode: 503,
      message: DATABASE_UNAVAILABLE_MESSAGE,
    });
    expect(json.mock.calls[0]?.[0]).not.toMatchObject({
      message: expect.stringContaining('DATABASE_URL'),
    });
  });

  it('não devolve stack trace em erro inesperado', () => {
    const { host, status, json } = createHost();
    const error = new Error('boom secret stack');
    error.stack = 'Error: boom secret stack\n    at secret.ts:1:1';

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: UNEXPECTED_ERROR_MESSAGE,
    });
    const body = json.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(body).not.toHaveProperty('stack');
    expect(JSON.stringify(body)).not.toContain('secret.ts');
  });
});
