import { MongooseModule } from "@nestjs/mongoose";
import { Book, BookSchema } from "./schema/books.schema";
import { Module } from "@nestjs/common";
import { BooksService } from "./books.service";
import { BooksController } from "./books.controller";
import { JwtModule } from "@nestjs/jwt";
import { User, UserSchema } from "../users/schema/users.schema";
import { CachesModule } from "../cache/cache.module";
import { CommentsModule } from "../comments/comments.module";
import { UsersModule } from "../users/users.module";
import { S3Module } from "../s3/s3.module";

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name: Book.name,
                schema: BookSchema
            },
            {
                name: User.name,
                schema: UserSchema
            }
        ]),
        JwtModule.register({}),
        CachesModule,
        CommentsModule,
        UsersModule,
        S3Module
    ],
    controllers: [BooksController],
    providers: [BooksService],
    exports: [BooksService]
})
export class BooksModule {}