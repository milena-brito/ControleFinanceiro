import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  it('GET /auth/me sem cookie retorna 401', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('POST /auth/register com dados inválidos retorna 400', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'A', email: 'invalido', password: '123' })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
