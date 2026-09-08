import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  assertProductionSecrets();

  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
}

function assertProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (
    !secret ||
    secret === 'altere-este-segredo-local' ||
    secret === 'dev-only-altere-o-jwt-secret'
  ) {
    throw new Error('JWT_SECRET é obrigatório em produção.');
  }

  if (!process.env.FRONTEND_ORIGIN) {
    throw new Error('FRONTEND_ORIGIN é obrigatório em produção.');
  }
}

await bootstrap();
