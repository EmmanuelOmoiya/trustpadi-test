import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { NODE_ENV } from './constants';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './common/interceptors/logger.interceptors';
import { BooksModule } from './modules/books/books.module';
import { CommentsModule } from './modules/comments/comments.module';
import { UsersModule } from './modules/users/users.module';
import { CachesModule } from './modules/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === NODE_ENV.PROD
          ? '.prod.env'
          : process.env.NODE_ENV === NODE_ENV.STAGGING
          ? '.staging.env'
          : '.dev.env',
    }),
    BooksModule,
    CommentsModule,
    UsersModule,
    CachesModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, { 
    provide: APP_INTERCEPTOR,
    useClass: LoggerInterceptor
   }],
})

export class AppModule {}
