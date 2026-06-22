import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
