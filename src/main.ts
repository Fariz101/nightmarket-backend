// backend-nestjs/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sesuaikan konfigurasi CORS Anda seperti ini
  app.enableCors({
    origin: 'http://localhost:3001', // URL Aplikasi Next.js Anda
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, app-key', // 🔑 Tambahkan 'app-key' di sini!
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();