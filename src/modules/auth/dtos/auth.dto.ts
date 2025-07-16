import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsAlpha,
  IsEmail,
  IsMobilePhone,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { ROLE } from '@//constants';
import { Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { Pagination } from '@//common/dto/pagination.dto';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Username',
        example: 'EmmanuelOmoiya',
        required: true,
        title: 'username'
    })
    @Transform(({ value }) => String(value).toLowerCase().trim())
    username: string;
    
    @IsEmail()
    @ApiProperty({
        description: 'Email',
        example: 'emmanuelomoiya6@gmail.com',
        required: true,
        title: 'email'
    })
    @Transform(({ value }) => String(value).toLowerCase().trim())
    email: string;

    @IsString()
    @MaxLength(20)
    @IsNotEmpty()
    @ApiProperty({
        description: 'Password',
        example: 'Dismair#2dji3',
        required: false,
        title: 'password',
    })
    @MinLength(7, {
        message: 'Password must be greater than 7 characters',
    })
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@<>%()&|#$+&*~_.,?;:/^^\\-]).{8,}$/, {
        message: 'Password must be at least one uppercase, lowercase, number and special character',
    })
    @IsOptional()
    @ValidateIf((o: RegisterDto) => {
        return typeof o.password !== undefined;
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'First Name',
        example: 'Emmanuel',
        required: true,
        title: 'first_name',
    })
    @IsAlpha()
    @Transform(
        ({ value }) => String(value).trim().charAt(0).toUpperCase() + value.substring(1).toLowerCase(),
    )
    first_name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Last Name',
        example: 'dubaril',
        required: true,
        title: 'last_name',
    })
    @Transform(
        ({ value }) => String(value).trim().charAt(0).toUpperCase() + value.substring(1).toLowerCase(),
    )
    @IsAlpha()
    last_name: string;
}


export class LoginDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email or Username',
    example: 'emmanuelomoiya6@gmail.com or EmmanuelOmoiya',
    required: true,
    title: 'email or username',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  identifier: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: 'Password',
    example: 'haJhsjk@#4jaiijsk',
    required: true,
    title: 'password',
  })
  password: string;
}

export class ResetPasswordDTO {
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({
    description: 'New Password',
    example: 'Password',
    required: true,
    title: 'newPassword',
  })
  newPassword: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Email or Username',
    example: 'emmanuelomoiya6@gmail.com or EmmanuelOmoiya',
    required: true,
    title: 'email or username',
  })
  @Transform(({ value }) => String(value).toLowerCase().trim())
  identifier: string;
}


export class AuthResponse {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: HttpStatus.CREATED })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'User Registration Successful' })
  message: string;

  @ApiProperty({
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjQ0ZWM0OTk5YjM4',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjQ0ZWM0OTk5YjM4Y',
    },
  })
  data: { accessToken: string; refreshToken: string };

  @ApiProperty({ example: null })
  error: Record<string, any> | string;
}

export class BadRequestResponse {
  @ApiProperty({ example: 'fail' })
  status: string;

  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: HttpStatus;

  @ApiProperty({ example: 'Email or Username already exist' })
  message: string;

  @ApiProperty({
    example: null,
  })
  data: { accessToken: string; refreshToken: string };

  @ApiProperty({ example: 'Bad Request' })
  error: Record<string, any> | string;
}
