import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Book, BookDocument } from './schema/books.schema';
import { errorHandler, handlePagination } from '@//utils';
import { Pagination } from '@//common/dto/pagination.dto';
import { IResponse, TokenData } from '@//interfaces';
import { CacheService } from '../cache/cache.service';
import { CreateBookDto, UpdateBookDto } from './dtos/book.dto';
import { CreateCommentDto } from '../comments/dtos/comment.dto';
import { CommentsService } from '../comments/comments.service';
import { User, UserDocument } from '../users/schema/users.schema';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject() private readonly cacheService: CacheService,
    @Inject() private readonly commentsService: CommentsService,
    @InjectModel(Book.name) private readonly booksModel: Model<BookDocument>,
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
    @Inject() private readonly s3Service: S3Service
  ) {}

  async getAllBooks(pagination: Pagination): Promise<IResponse<Book[]>> {
    try {
      const { page: pageNum, limit: size } = pagination;
      const { page, limit } = handlePagination(pageNum, size);
      const skipExp: number = page > 1 ? page - 1 : 0;
      const toSkip = limit * skipExp;

      const cacheKey = `books:list:page-${page}-limit-${limit}`;

      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached as any);
        return {
          status: 'success',
          statusCode: HttpStatus.OK,
          message: 'Books fetched from cache',
          data: {
            items: parsed.items,
            pagination: {
              page,
              limit,
              totalCount: parsed.totalCount,
              totalPages: Math.ceil(parsed.totalCount / limit),
              hasNextPage: page < Math.ceil(parsed.totalCount / limit),
              hasPreviousPage: page > 1,
            },
          },
          error: null,
        };
      }

      const books = await this.booksModel
        .find({}, 'title description author cover genre').populate('author', 'first_name last_name username')
        .skip(toSkip)
        .limit(limit)
        .sort({ created_at: -1 })
        .lean()
        .exec();
      const totalCount = await this.booksModel.countDocuments();


      await this.cacheService.save({
        key: cacheKey,
        data: JSON.stringify({
          items: books,
          totalCount,
        }) as any,
        ttl: 60 * 5,
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Books fetched successfully',
        data: {
            items: books,
            pagination: {
              page,
              limit,
              totalCount: totalCount,
              totalPages: Math.ceil(totalCount / limit),
              hasNextPage: page < Math.ceil(totalCount / limit),
              hasPreviousPage: page > 1,
            },
        },
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Book fetch failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async getBookById(bookId: Types.ObjectId) {
    try {
      const cacheKey = `books:item:${bookId}`;

      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return {
          status: 'success',
          statusCode: HttpStatus.OK,
          message: 'Book fetched from cache',
          data: cached,
          error: null,
        };
      }

      const book = await this.booksModel
        .findOne({ _id: bookId }, 'title description author cover genre')
        .populate('author', 'first_name last_name username')
        .exec();

        if (!book) {
        throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Book not found!',
        });
        }
      await this.cacheService.save({
        key: cacheKey,
        data: JSON.stringify(book) as any,
        ttl: 60 * 5,
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Book retrieved successfully',
        data: book,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
    }
  }

  async createBook(
    userData: TokenData,
    payload: CreateBookDto,
    file: Express.Multer.File
  ): Promise<IResponse> {
    const { user } = userData;
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(
        async (session) => {
          const { title } = payload;
          const isExistingBook = await this.booksModel
            .findOne({ title })
            .session(session)
            .exec();

          if (isExistingBook) {
            throw new BadRequestException({
              statusCode: HttpStatus.BAD_REQUEST,
              message: 'Book already exist',
            });
          }

          let imageUrl: string | null = null;
          if (file) {
            imageUrl = await this.s3Service.uploadFile(file);
          }

          const [book] = await this.booksModel.create<Partial<BookDocument>>(
            [
              {
                ...payload,
                author: user as Types.ObjectId,
                cover: imageUrl as string
              },
            ],
            { session },
          );

          await this.usersModel.updateOne(
            { _id: user },
            { $push: { books: book._id } },
            { session },
          );

          await session.commitTransaction();
        },
        {
          readConcern: 'majority',
          writeConcern: { w: 'majority', j: true },
          retryWrites: true,
        },
      );

      await this.cacheService.delete('books:list');

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Book Creation Successful',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);

      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Book Creation failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    } finally {
      await session.endSession();
    }
  }

  async updateBook(
    auth: TokenData,
    bookId: Types.ObjectId,
    payload: UpdateBookDto,
  ): Promise<IResponse> {
    const { user } = auth;
    try {
      const isExistingBook = await this.booksModel
        .findOne({ _id: bookId, author: user })
        .exec();

      if (!isExistingBook) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Book not found!',
        });
      }
      await this.booksModel
        .findOneAndUpdate({ _id: bookId, author: user }, payload)
        .exec();
    await this.cacheService.delete(`books:item:${bookId}`)
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Book updated successfully',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);

      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Book Update failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async deleteBook(
    auth: TokenData,
    bookId: Types.ObjectId,
  ): Promise<IResponse> {
    const { user } = auth;
    try {
      const isExistingBook = await this.booksModel
        .findOne({ _id: bookId, author: user })
        .exec();

      if (!isExistingBook) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Book not found!',
        });
      }
      await this.booksModel
        .findOneAndDelete({ _id: bookId, author: user })
        .exec();
    await this.cacheService.delete(`books:item:${bookId}`)
      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Book deleted successfully',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);

      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Book Delete failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async commentOnBook(
    auth: TokenData,
    bookId: Types.ObjectId,
    payload: CreateCommentDto,
  ): Promise<IResponse> {
    const { user } = auth;
    const { content } = payload;
    try {
      const comment = await this.commentsService.createComment(
        user as Types.ObjectId,
        bookId,
        content,
      );

      if (!comment) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Comment failed to create',
          data: null,
          error: 'Comment or book not found',
        };
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Commented on book successfully',
        data: null,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);

      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Book Delete failed',
        data: null,
        error: error?.message || 'An unexpected error occurred',
      };
    }
  }

  async getBookComments(
    auth: TokenData,
    bookId: Types.ObjectId,
    pagination: Pagination,
  ) {
    try {
      const { page: pageNum, limit: size } = pagination;
      const { page, limit } = handlePagination(pageNum, size);
      const skipExp: number = page > 1 ? page - 1 : 0;
      const toSkip = limit * skipExp;
      const cacheKey = `books:item:${bookId}:comments:page-${page}-limit-${limit}`;

      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached as any)
        return {
          status: 'success',
          statusCode: HttpStatus.OK,
          message: 'Book Comments fetched from cache',
          data: {
            items: parsed.items,
            pagination: {
                page,
                limit,
                totalCount: parsed.totalCount,
                totalPages: Math.ceil(parsed.totalCount / limit),
                hasNextPage: page < Math.ceil(parsed.totalCount / limit),
                hasPreviousPage: page > 1,
            },
            },
          error: null,
        };
      }

      const comments = await this.commentsService.getCommentsByBookId(
        bookId,
        toSkip,
        limit,
      );
      if (!comments) {
        return {
          status: 'fail',
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Comments not found',
          data: null,
          error: 'No comments found for this book',
        };
      }

      await this.cacheService.save({
        key: cacheKey,
        data: JSON.stringify(comments) as any,
        ttl: 60 * 5,
      });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Book Comments retrieved successfully',
        data: {
            items: comments.items,
            pagination: {
              page,
              limit,
              totalCount: comments.totalCount,
              totalPages: Math.ceil(comments.totalCount / limit),
              hasNextPage: page < Math.ceil(comments.totalCount / limit),
              hasPreviousPage: page > 1,
            },
        },
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);

      return {
        status: 'fail',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve book comments',
        data: null,
        error: error?.message || 'Unexpected error',
      };
    }
  }
}
