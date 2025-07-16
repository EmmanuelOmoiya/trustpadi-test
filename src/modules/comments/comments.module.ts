import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./schema/comments.schema";
import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtModule } from "@nestjs/jwt";
import { Book, BookSchema } from "../books/schema/books.schema";
import { CachesModule } from "../cache/cache.module";
import { UsersModule } from "../users/users.module";

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name: Comment.name,
                schema: CommentSchema
            },
            {
                name: Book.name,
                schema: BookSchema
            }
        ]),
        JwtModule.register({}),
        CachesModule,
        UsersModule
    ],
    controllers: [],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule {}