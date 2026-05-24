import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Mengizinkan origin apa pun secara dinamis (termasuk localhost:3000)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    optionsSuccessStatus: 204, // Mengembalikan status sukses 204 untuk Preflight OPTIONS
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
