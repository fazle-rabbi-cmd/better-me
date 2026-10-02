import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing for refresh tokens
  app.use(cookieParser());

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Global validation pipe for DTO security & validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties that do not have decorators
      forbidNonWhitelisted: true, // Throws an error if unknown properties are sent
      transform: true, // Automatically transforms payloads to DTO class instances
    }),
  );

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 5000}/api/v1`);
}
bootstrap();