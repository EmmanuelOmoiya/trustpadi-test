import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@//constants';

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    constructor(
      private s3Client: S3Client,
      private readonly configService: ConfigService,
    ) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const params = {
      Bucket: this.configService.get<string>(ENV.AWS_S3_CONFIG_BUCKET_NAME),
      Key: `books/covers/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1'
      }
    };

    await this.s3Client.send(new PutObjectCommand(params));

    return `${this.configService.get<string>(ENV.AWS_S3_CONFIG_CLOUDFRONT_URL)}/${params.Key}`;
  }
}