import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { ACCESS_TOKEN_COOKIE } from '../src/auth/auth.constants.js';
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

  afterEach(async () => {
    await app.close();
  });
});
