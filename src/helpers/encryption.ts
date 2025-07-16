import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ENV } from '../constants';

const IV_LENGTH = 16;
@Injectable()
class EncryptService {
  constructor(private readonly config: ConfigService) {}

  async encrypt(plainText: string) {
    const iv = crypto.randomBytes(IV_LENGTH);

    const key = process.env.ENCRYPTION_KEY || this.config.get(ENV.ENCRYPTION_KEY);

    const cipher: any = crypto.createCipheriv('AES-256-GCM', Buffer.from(key as any), iv);

    const encrypted = Buffer.concat([cipher.update(plainText), cipher.final()]);

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}_${encrypted.toString('hex')}_${authTag}`;
  }

  async decrypt(cipherText: any) {
    const textParts = cipherText.split('_');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const key = process.env.ENCRYPTION_KEY || this.config.get(ENV.ENCRYPTION_KEY);

    const encryptedText = Buffer.from(textParts.shift(), 'hex');
    const authTag = Buffer.from(textParts.shift(), 'hex');

    const decipher: any = crypto.createDecipheriv('AES-256-GCM', Buffer.from(key as any), iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString();
  }
}

export default EncryptService;
