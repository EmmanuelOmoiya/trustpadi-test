import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';

const mongoID = Joi.string().regex(/^[a-fA-F0-9]{24}$/);

@Injectable()
export class MongoIDPipe implements PipeTransform {
  transform(value: any) {
    const { error } = mongoID.validate(value);
    if (error) {
      throw new BadRequestException(error);
    }

    return value;
  }
}
