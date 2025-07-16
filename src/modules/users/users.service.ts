import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { User, UserDocument } from './schema/users.schema';
import { errorHandler } from '@//utils';
import { IResponse } from '@//interfaces';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async followUser(
    authUserId: Types.ObjectId,
    targetUserId: Types.ObjectId,
  ): Promise<IResponse | any> {
    console.log(authUserId)
    console.log(targetUserId)
    if (authUserId.equals(targetUserId)) {
      return {
        status: 'fail',
        statusCode: HttpStatus.BAD_REQUEST,
        message: "You can't follow yourself",
        data: null,
        error: 'Invalid operation',
      };
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(
        async () => {
          const [authUser, targetUser] = await Promise.all([
            this.usersModel.findById(authUserId).session(session),
            this.usersModel.findById(targetUserId).session(session),
          ]);

          if (!targetUser)
            throw new NotFoundException('User to follow not found');

          // Prevent duplicate follow
          if (authUser?.following.includes(targetUserId)) {
            throw new BadRequestException('Already following this user');
          }

          authUser?.following.push(targetUserId);
          targetUser.followers.push(authUserId);

          await Promise.all([
            authUser?.save({ session }),
            targetUser.save({ session }),
          ]);

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
        statusCode: HttpStatus.OK,
        message: 'Followed user successfully',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Follow failed',
        data: null,
        error: error?.message || 'Unexpected error',
      };
    } finally {
      await session.endSession();
    }
  }


async unfollowUser(
  authUserId: Types.ObjectId,
  targetUserId: Types.ObjectId,
): Promise<IResponse> {
  if (authUserId.equals(targetUserId)) {
    return {
      status: 'fail',
      statusCode: HttpStatus.BAD_REQUEST,
      message: "You can't unfollow yourself",
      data: null,
      error: 'Invalid operation',
    };
  }

  const session = await this.connection.startSession();

  try {
    await session.withTransaction(async () => {
      const [authUser, targetUser] = await Promise.all([
        this.usersModel.findById(authUserId).session(session),
        this.usersModel.findById(targetUserId).session(session),
      ]);

      if (!authUser || !targetUser) {
        throw new NotFoundException('User not found');
      }

      const isFollowing = authUser.following.some((id) =>
        id.equals(targetUserId),
      );

      if (!isFollowing) {
        throw new BadRequestException('You are not following this user');
      }

      // Remove targetUser from authUser's following
      authUser.following = authUser.following.filter(
        (id) => !id.equals(targetUserId),
      );

      // Remove authUser from targetUser's followers
      targetUser.followers = targetUser.followers.filter(
        (id) => !id.equals(authUserId),
      );

      await Promise.all([
        authUser.save({ session }),
        targetUser.save({ session }),
      ]);
    });

    return {
      status: 'success',
      statusCode: HttpStatus.OK,
      message: 'Unfollowed user successfully',
      data: null,
      error: null,
    };
  } catch (error) {
    this.logger.error(error);
    errorHandler(error);

    return {
      status: 'fail',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unfollow failed',
      data: null,
      error: error?.message || 'Unexpected error',
    };
  } finally {
    await session.endSession();
  }
}


  async getFollowers(userId: Types.ObjectId): Promise<IResponse> {
    try {
      const user = await this.usersModel
        .findById({ _id: userId })
        .populate('followers', 'username first_name last_name')
        .lean();

      if (!user) throw new NotFoundException('User not found');

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Followers retrieved',
        data: user.followers,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not retrieve followers',
        data: null,
        error: error?.message || 'Unexpected error',
      };
    }
  }

  async getFollowing(userId: Types.ObjectId): Promise<IResponse> {
    try {
      const user = await this.usersModel
        .findById({ _id: userId })
        .populate('following', 'username first_name last_name')
        .lean();

      if (!user) throw new NotFoundException('User not found');

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Following retrieved',
        data: user.following,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Could not retrieve following list',
        data: null,
        error: error?.message || 'Unexpected error',
      };
    }
  }
}
