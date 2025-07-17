import { Module } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [ConfigModule],
//   controllers: [S3Controller],
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          region: configService.get<string>('AWS_S3_CONFIG_REGION'),
          credentials: {
            accessKeyId: configService.getOrThrow<string>('AWS_S3_CONFIG_ACCESS_KEY'),
            secretAccessKey: configService.getOrThrow<string>('AWS_S3_CONFIG_SECRET_ACCESS_KEY'),
          },
        });
      },
      inject: [ConfigService],
    },
    S3Service],
  exports: [S3Service]
})

export class S3Module {}
