import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';

  app.use(cookieParser());
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
}

await bootstrap();
