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
  app.enableVersioning({
    type: VersioningType.URI,
  });
  const SWAGGER_ENVS = ['development', 'production'];

  if (SWAGGER_ENVS.includes(ENV.NODE_DEV)) {
    // Can be used later to make access private
    // app.use(
    //   ['/docs'],
    //   expressBasicAuth({
    //     challenge: true,
    //     users: {
    //       [ENV.SWAGGER_USER]: ENV.SWAGGER_PASSWORD,
    //     },
    //   }),
    // );
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
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.use(morgan('dev'));
  app.useBodyParser('json', { limit: '10mb' });
  
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
