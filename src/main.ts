// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Mengaktifkan CORS agar Next.js Anda bisa menembak API ini
  app.enableCors({
    origin: '*', // Bisa diperketat menggunakan URL Next.js production Anda nanti
    credentials: true,
  });

  // 🔴 UBAH BAGIAN INI: Wajib dengerin process.env.PORT dari Railway
  const port = process.env.PORT || 5001; 
  await app.listen(port, '0.0.0.0'); // Tambahkan '0.0.0.0' agar bisa diikat oleh router internal Railway
  
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
