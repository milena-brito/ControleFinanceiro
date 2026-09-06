import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { App } from 'supertest/types';
import { ACCESS_TOKEN_COOKIE } from '../src/auth/auth.constants.js';
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from '../src/common/http-exception.constants.js';
import { authCookie, createPrismaStub, createTestApp } from './create-app.js';

describe('Auth (e2e)', () => {
  const prisma = createPrismaStub();
  let app: INestApplication<App>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createTestApp(prisma);
  });

  it('GET /auth/me sem cookie retorna 401', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me com token inválido retorna 401', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', `${ACCESS_TOKEN_COOKIE}=token-invalido`)
      .expect(401);
  });

  it('POST /auth/register com dados inválidos retorna 400', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'A', email: 'invalido', password: '123' })
      .expect(400);
  });

  it('POST /auth/register não devolve o hash da senha', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'Milena',
      email: 'milena@email.com',
      passwordHash: 'hash-secreto',
    });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Milena',
        email: 'milena@email.com',
        password: 'senha1234',
      })
      .expect(201);

    expect(response.body.user).toEqual({
      id: 'user-1',
      name: 'Milena',
      email: 'milena@email.com',
    });
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.headers['set-cookie']?.[0]).toContain(ACCESS_TOKEN_COOKIE);
  });

  it('POST /auth/login com senha errada retorna 401 genérico', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'milena@email.com', password: 'senha1234' })
      .expect(401);

    expect(response.body.message).toBe('E-mail ou senha inválidos.');
  });

  it('GET /auth/me com cookie válido devolve o perfil', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Milena',
      email: 'milena@email.com',
      passwordHash: 'hash-secreto',
    });

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', await authCookie(app))
      .expect(200);

    expect(response.body).toEqual({
      id: 'user-1',
      name: 'Milena',
      email: 'milena@email.com',
    });
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('POST /auth/login com banco indisponível devolve mensagem amigável', async () => {
    prisma.user.findUnique.mockRejectedValue(
      new Prisma.PrismaClientInitializationError(
        'Environment variable not found: DATABASE_URL.',
        '6.19.3',
      ),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'milena@email.com', password: 'senha1234' })
      .expect(503);

    expect(response.body.message).toBe(DATABASE_UNAVAILABLE_MESSAGE);
    expect(JSON.stringify(response.body)).not.toContain('DATABASE_URL');
  });

  it('POST /auth/login com erro inesperado não devolve stack', async () => {
    const error = new Error('falha secreta');
    error.stack = 'Error: falha secreta\n    at secret.ts:1:1';
    prisma.user.findUnique.mockRejectedValue(error);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'milena@email.com', password: 'senha1234' })
      .expect(500);

    expect(response.body.message).toBe(UNEXPECTED_ERROR_MESSAGE);
    expect(response.body).not.toHaveProperty('stack');
    expect(JSON.stringify(response.body)).not.toContain('secret.ts');
  });

  afterEach(async () => {
    await app.close();
  });
});
