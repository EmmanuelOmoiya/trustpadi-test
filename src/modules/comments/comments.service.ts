import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schema/comments.schema';
import { errorHandler } from '@//utils';
import { Book, BookDocument } from '../books/schema/books.schema';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(
    @InjectModel(Comment.name)
    private readonly commentsModel: Model<CommentDocument>,
    @InjectModel(Book.name) private readonly booksModel: Model<BookDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createComment(
    userId: Types.ObjectId,
    bookId: Types.ObjectId,
    commentText: string,
  ): Promise<CommentDocument | null> {
    let createdComment;
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(
        async (session) => {
          const [comment] = await this.commentsModel.create<
            Partial<CommentDocument>
          >(
            [
              {
                content: commentText,
                book: bookId,
                commentBy: userId,
              },
            ],
            { session },
          );
          createdComment = comment;

          await this.booksModel.updateOne(
            { _id: bookId },
            { $push: { comments: comment._id } },
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

      return createdComment;
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return null;
    } finally {
      await session.endSession();
    }
  }

  async getCommentsByBookId(
    bookId: Types.ObjectId,
    toSkip: number,
    limit: number,
  ): Promise<{ items: CommentDocument[], totalCount: number } | null> {
    try {
      const comments = await this.commentsModel
        .find({ book: bookId }, 'content commentBy').populate('commentBy', 'first_name last_name username')
        .skip(toSkip)
        .limit(limit)
        .sort({ created_at: -1 })
        .lean()
        .exec();
    const totalCount = (await this.commentsModel.find({ book: bookId }, 'content')).length
        return {
            items: comments,
            totalCount
        }
    } catch (error) {
      this.logger.error(error);
      errorHandler(error);
      return null;
    }
  }
}
