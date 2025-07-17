import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('upload')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  // @ts-ignore
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.s3Service.uploadFile(file);
    return { url: fileUrl };
  }
}