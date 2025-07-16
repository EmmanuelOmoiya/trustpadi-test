import { HttpStatus } from '@nestjs/common';

export interface GenericMatch {
  [key: string]: GenericType;
}

export type GenericType<T = void> = string | number | Date | unknown | T;
export interface IResponse<T = void> {
  status: 'success' | 'fail';
  message: string;
  statusCode: HttpStatus;
  data: T | any;
  error: any;
  meta?: any;
}

export interface CacheInterface extends Document {
  key: string;
  data: string;
  ttl: number;
  dateCreated?: Date;
  dateUpdated?: Date;
}
