import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';

// Joi validator Pipe for all modules
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(_value: any) {
    const { error, value } = this.schema.validate(_value, {
      abortEarly: true,
      allowUnknown: true,
      convert: false,
      skipFunctions: false,
      errors: {
        wrap: {
          label: '',
        },
      },
    });
    if (error) {
      throw new BadRequestException(error);
    }
    return value;
  }
}
export const injectJoiSchema = (schema: ObjectSchema) => new JoiValidationPipe(schema);
