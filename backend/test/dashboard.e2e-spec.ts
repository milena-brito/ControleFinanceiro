import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { authCookie, createPrismaStub, createTestApp } from './create-app.js';

describe('Dashboard (e2e)', () => {
  const prisma = createPrismaStub();
  let app: INestApplication<App>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createTestApp(prisma);
  });

  it('GET /dashboard sem autenticação retorna 401', () => {
    return request(app.getHttpServer()).get('/dashboard').expect(401);
  });

  it('GET /dashboard autenticado com só uma data retorna 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .query({ from: '2026-09-01' })
      .set('Cookie', await authCookie(app))
      .expect(400);

    expect(response.body.message).toBe('Informe o início e o fim do período.');
  });

  it('GET /dashboard autenticado devolve totais zerados e gasto diário', async () => {
    prisma.transaction.groupBy.mockResolvedValue([]);
    prisma.transaction.findMany.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get('/dashboard')
      .query({ from: '2026-09-01', to: '2026-09-30' })
      .set('Cookie', await authCookie(app))
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        income: '0.00',
        expense: '0.00',
        balance: '0.00',
        expensesByCategory: [],
        recentTransactions: [],
        dailyAllowance: expect.objectContaining({
          availableBalance: '0.00',
          dailyAmount: expect.any(String),
          remainingDays: expect.any(Number),
        }),
      }),
    );
  });

  afterEach(async () => {
    await app.close();
  });
});
