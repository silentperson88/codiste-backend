import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionFilter } from './custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configure CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Update this with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalFilters(new CustomExceptionFilter());
  await app.listen(4000);
}
bootstrap();
