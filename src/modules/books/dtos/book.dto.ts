import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class CreateBookDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Title',
    example: 'The Dawn of Dan Charles II',
    required: true,
    title: 'title',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  title: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Description',
    example: 'The tragic story of how Dan Charles II of Koama land met his ending.',
    required: true,
    title: 'description',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  description: string;
}

export class UpdateBookDto {
  @IsOptional()
  @ApiProperty({
    description: 'Title',
    example: 'The Dawn of Dan Charles II',
    required: true,
    title: 'title',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  title?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Description',
    example: 'The tragic story of how Dan Charles II of Koama land met his ending.',
    required: true,
    title: 'description',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  description?: string;
}

export class ParamsWithIdDto {
  @IsMongoId()
  id: Types.ObjectId;
}