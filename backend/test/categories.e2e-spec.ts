import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { authCookie, createPrismaStub, createTestApp } from './create-app.js';

describe('Categories (e2e)', () => {
  const prisma = createPrismaStub();
  let app: INestApplication<App>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createTestApp(prisma);
  });

  it('GET /categories sem autenticação retorna 401', () => {
    return request(app.getHttpServer()).get('/categories').expect(401);
  });

  it('POST /categories sem autenticação retorna 401', () => {
    return request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Pets' })
      .expect(401);
  });

  it('POST /categories autenticado com nome curto retorna 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Cookie', await authCookie(app))
      .send({ name: 'A' })
      .expect(400);

    expect(response.body.message).toBe('Informe pelo menos 2 caracteres.');
    expect(prisma.category.create).not.toHaveBeenCalled();
  });

  it('GET /categories autenticado devolve a lista do usuário', async () => {
    prisma.category.findMany.mockResolvedValue([
      { id: 'cat-1', name: 'Alimentação', userId: null },
    ]);

    const response = await request(app.getHttpServer())
      .get('/categories')
      .set('Cookie', await authCookie(app))
      .expect(200);

    expect(response.body).toEqual([
      { id: 'cat-1', name: 'Alimentação', isDefault: true },
    ]);
  });

  afterEach(async () => {
    await app.close();
  });
});
