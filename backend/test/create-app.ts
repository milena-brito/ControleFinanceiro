import cookieParser from 'cookie-parser';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { ACCESS_TOKEN_COOKIE } from '../src/auth/auth.constants.js';
import { PrismaService } from '../src/database/prisma.service.js';

export function createPrismaStub() {
  return {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
}

export async function createTestApp(
  prisma: ReturnType<typeof createPrismaStub>,
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .compile();

  const app = module.createNestApplication();
  app.use(cookieParser());
  await app.init();
  return app;
}

export async function authCookie(
  app: INestApplication,
  user = { id: 'user-1', email: 'milena@email.com' },
): Promise<string> {
  const token = await app.get(JwtService).signAsync({
    sub: user.id,
    email: user.email,
  });
  return `${ACCESS_TOKEN_COOKIE}=${token}`;
}
