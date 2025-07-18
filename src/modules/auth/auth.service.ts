import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { errorHandler } from '@//utils';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { RegisterDto, LoginDto, ResetPasswordDTO } from './dtos';
import { ENV } from '@//constants';
import { User, UserDocument } from '../users/schema/users.schema';
import { ConfigService } from '@nestjs/config';
import { ClientSession, Connection, Model } from 'mongoose';
import { IResponse, TokenData } from '@//interfaces';
import EncryptService from '@//helpers/encryption';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
    @Inject(EncryptService) private readonly encryptionService: EncryptService,
  ) {}

  getHello(): object {
    return {
      message: 'Welcome to Auth service',
    };
  }

  async register(
    payload: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<IResponse<{ accessToken: string; refreshToken: string } | null>> {
    let data: { accessToken: string; refreshToken: string } | null = null;
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(
        async (session) => {
          const { username, email } = payload;
          const filterParams = JSON.parse(JSON.stringify({ username, email }));
          const isExistingUser = await this.usersModel
            .findOne({ ...filterParams })
            .session(session)
            .exec();

          if (isExistingUser) {
            throw new BadRequestException({
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Email or Username already exist',
            });
          }

          if (payload.password) {
            payload.password = await bcrypt.hash(
              payload.password,
              parseInt(process.env.SALT_ROUNDS as any, 10) || 10,
            );
          }
          const [user] = await this.usersModel.create<Partial<UserDocument>>(
            [
              {
                ...payload,
              },
            ],
            { session },
          );

          const tokenData: TokenData = {
            verified: true,
            user: user._id as any,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            followers_count: user.followers.length,
            following_count: user.following.length,
          };

          
          
          const { accessToken, refreshToken } = await this.getAndUpdateToken(
            tokenData,
            user,
            session,
          );
          data = { accessToken, refreshToken };
          res.setHeader('Authorization', `Bearer ${accessToken}`)
          res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: this.configService.get<string>(ENV.NODE_ENV) === 'production',
            sameSite: 'lax',
            maxAge: parseInt((this.configService.get<string>(ENV.JWT_ACCESS_TOKEN_EXPIRATION_TIME) as string).slice(0, -1) ) * 60 * 1000, // 15 minutes
          });

          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: this.configService.get<string>(ENV.NODE_ENV) === 'production',
            sameSite: 'lax',
            maxAge: parseInt((this.configService.get<string>(ENV.JWT_REFRESH_TOKEN_EXPIRATION_TIME) as string).slice(0, -1) ) * 60 * 1000, // 7 days
          });
          await session.commitTransaction();
        },
        {
          readConcern: 'majority',
          writeConcern: { w: 'majority', j: true },
          retryWrites: true,
        },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User Registration Successful',
        data,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Registration failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    } finally {
      await session.endSession();
    }
  }

  async login(
    payload: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<IResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      const { identifier, password } = payload;
      const authType = identifier.includes('@') ? 'email' : 'username';
      const user: UserDocument | null = await this.usersModel.findOne({
        [authType]: identifier,
      });
      if (!user || !user.password) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Login fail',
        });
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid password',
        });
      }

      const tokenData: TokenData = {
        verified: true,
        user: user._id as any,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        followers_count: user.followers.length,
        following_count: user.following.length,
      };

      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        user,
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: this.configService.get<string>(ENV.NODE_ENV) === 'production',
        sameSite: 'lax',
        maxAge: parseInt((this.configService.get<string>(ENV.JWT_ACCESS_TOKEN_EXPIRATION_TIME) as string).slice(0, -1) ) * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>(ENV.NODE_ENV) === 'production',
        sameSite: 'lax',
        maxAge: parseInt((this.configService.get<string>(ENV.JWT_REFRESH_TOKEN_EXPIRATION_TIME) as string).slice(0, -1) ) * 60 * 1000, // 7 days
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Authentication successful',
        data: { accessToken, refreshToken },
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);

      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Login failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async logout({ user }: TokenData): Promise<IResponse> {
    try {
        let userDetails = await this.usersModel.findOne({ _id: user });
        if(userDetails?.refreshToken as any === null){
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Already logged out!',
            });
        }
        await this.usersModel
        .findOneAndUpdate({ _id: user }, { refreshToken: null })
        .exec();
        return {
            status: 'success',
            statusCode: HttpStatus.OK,
            message: 'Logged out successfully',
            data: null,
            error: null,
        };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);

      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Logout failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async refreshTokens(
    payload: TokenData & { refreshToken: string },
  ): Promise<IResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      const { refreshToken: token, user: userId } = payload;
      const user = await this.usersModel.findById(userId);

      if (!user || !user.refreshToken)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });
      const decryptToken = await await this.encryptionService.decrypt(
        user.refreshToken,
      );
      if (decryptToken !== token)
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access Denied',
        });
      const tokenData: TokenData = {
        verified: true,
        user: user._id as any,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        followers_count: user.followers.length,
        following_count: user.following.length,
      };
      const { accessToken, refreshToken } = await this.getAndUpdateToken(
        tokenData,
        user,
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Token successfully generated',
        data: { accessToken, refreshToken },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Refresh failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async resetPassword(payload: ResetPasswordDTO): Promise<IResponse> {
    try {
      const { newPassword, identifier } = payload;

      // check if identifier exists
      const authType = identifier.includes('@') ? 'email' : 'username';
      const isExistingUser = await this.usersModel
        .findOne({ [authType]: identifier })
        .lean();
      if (!isExistingUser) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'User does not exist',
        });
      }
      const { email } = isExistingUser;
      //  save and hash and update users new password
      const hashedPassword = await bcrypt.hash(
        newPassword,
        parseInt(process.env.SALT_ROUNDS as any, 10) || 10,
      );
      await this.usersModel
        .findOneAndUpdate({ email }, { password: hashedPassword })
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Password reset sucessfully.',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Reset failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async getAndUpdateToken(
    tokenData: TokenData,
    user: UserDocument,
    session?: ClientSession,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { accessToken, refreshToken } = await this.getTokens(tokenData);
    const encryptRefreshToken =
      await this.encryptionService.encrypt(refreshToken);
    await this.usersModel
      .findOneAndUpdate(
        { _id: user._id },
        { refreshToken: encryptRefreshToken },
      )
      .session(session as ClientSession)
      .lean()
      .exec();
    return { accessToken, refreshToken };
  }

  async getTokens(
    payload: TokenData,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(ENV.JWT_ACCESS_TOKEN_SECRET),
        expiresIn: this.configService.get<string>(
          ENV.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>(ENV.JWT_REFRESH_TOKEN_SECRET),
        expiresIn: this.configService.get<string>(
          ENV.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        ),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
