import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { authCookie, createPrismaStub, createTestApp } from './create-app.js';

describe('Transactions (e2e)', () => {
  const prisma = createPrismaStub();
  let app: INestApplication<App>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createTestApp(prisma);
  });

  it('GET /transactions sem autenticação retorna 401', () => {
    return request(app.getHttpServer()).get('/transactions').expect(401);
  });

  it('POST /transactions sem autenticação retorna 401', () => {
    return request(app.getHttpServer())
      .post('/transactions')
      .send({
        type: 'EXPENSE',
        amount: 10,
        description: 'Almoço',
        date: '2026-09-01',
        categoryId: '11111111-1111-4111-8111-111111111111',
      })
      .expect(401);
  });

  it('POST /transactions autenticado com dados inválidos retorna 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/transactions')
      .set('Cookie', await authCookie(app))
      .send({
        type: 'EXPENSE',
        amount: 0,
        description: 'Almoço',
        date: '2026-09-01',
        categoryId: '11111111-1111-4111-8111-111111111111',
      })
      .expect(400);

    expect(response.body.message).toBe('O valor deve ser maior que zero.');
    expect(prisma.transaction.create).not.toHaveBeenCalled();
  });

  it('GET /transactions autenticado lista só o que o serviço consultar', async () => {
    prisma.transaction.findMany.mockResolvedValue([]);
    prisma.transaction.count.mockResolvedValue(0);

    await request(app.getHttpServer())
      .get('/transactions')
      .set('Cookie', await authCookie(app))
      .expect(200)
      .expect({ items: [], total: 0, page: 1, limit: 20 });
  });

  afterEach(async () => {
    await app.close();
  });
});
