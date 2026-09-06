import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { createPrismaStub, createTestApp } from './create-app.js';

describe('Health (e2e)', () => {
  const prisma = createPrismaStub();
  let app: INestApplication<App>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createTestApp(prisma);
  });

  it('GET /health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  afterEach(async () => {
    await app.close();
  });
});
