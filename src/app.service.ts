import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return "Welcome to the book management API, a test taken by Emmanuel Omoiya for TrustPadi, visit /docs to view the documentation"
  }
}
