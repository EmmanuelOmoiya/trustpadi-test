import { IsNumber, IsObject, IsString } from 'class-validator';
import { GenericMatch } from 'src/interfaces/generic.interface';

export class RegisterCacheDto {
  @IsObject()
  data: GenericMatch;

  @IsNumber()
  ttl: number;

  @IsString()
  key: string;
}
