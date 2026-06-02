// backend: src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ PENTING: Aktifkan ini dengan benar agar port 3000 diizinkan masuk
  app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://night-market-aa3e26ngc-farizs-projects-1748eafb.vercel.app',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 5001; 
  await app.listen(port, '0.0.0.0'); 
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
