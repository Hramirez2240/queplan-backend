import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Queplan API')
    .setDescription('The API details for the Queplan application using NestJS.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  console.log(`Server running on port ${process.env.PORT ?? 3000}`);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
