import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    json({
      verify: (req: any, _res, buf) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        req.rawBody = buf.toString();
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.enableCors();

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
