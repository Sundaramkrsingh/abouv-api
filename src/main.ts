import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/utils/global-exception.filter';
import { ZodExceptionFilter } from './shared/utils/zod-exception.filter';
import { PrismaExceptionFilter } from './shared/utils/prisma-exception.filter';
import { swaggerConfig } from 'swagger.config';

async function bootstrap() {
  const allowedOrigins = (process.env.BASE_URLS || '')
    .split(',')
    .map((url) => url.trim());

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  app.use((req, res, next) => {
    res.setTimeout(5 * 60 * 1000); // 5 minutes
    next();
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalFilters(new ZodExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter());

  if (process.env.SERVER_ENV !== 'PROD') {
    swaggerConfig(app);
  }

  await app.listen(3001);
}

bootstrap();
