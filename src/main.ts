import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ENV } from './constants';
import * as expressBasicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './helpers';
import morgan = require('morgan');
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const SWAGGER_ENVS = ['development', 'production'];

  if (SWAGGER_ENVS.includes(ENV.NODE_DEV)) {
    app.use(
      ['/docs'],
      expressBasicAuth({
        challenge: true,
        users: {
          [ENV.SWAGGER_USER]: ENV.SWAGGER_PASSWORD,
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('TrustPadi Test')
      .setDescription('TrustPadi Test API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .setExternalDoc('Postman Collection', '/api-json')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(helmet());
  app.enableCors();
  app.use(morgan('dev'));
  app.useBodyParser('json', { limit: '10mb' });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // app.useGlobalPipes(new ValidationPipe({
  //   transform: true,
  //   whitelist: true,
  //   forbidNonWhitelisted: true
  // }));
  // app.enableCors({
  //   origin: ['http://localhost:3000', 'https://cjtutors.com', "https://www.cjtutors.com", 'https://admin.cjtutors.com', 'https://tutor.cjtutors.com', 'https://student.cjtutors.com', "https://go.room.sh"],
  //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
