import { Controller, Get, UseGuards, Req, Post, Body, Param, Query, Put, Delete } from "@nestjs/common";
import { BooksService } from "./books.service";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Pagination } from "@//common/dto/pagination.dto";
import { CreateBookDto, ParamsWithIdDto, UpdateBookDto } from "./dtos/book.dto";
import { TokenData } from "@//interfaces";
import { CreateCommentDto } from "../comments/dtos/comment.dto";
import { AccessTokenGuard } from "../auth/guards/jwt.guard";
import { Types } from "mongoose";

@Controller({ version: '1', path: 'books' })
export class BooksController {
    constructor(private booksService: BooksService){}

    @Get('')
    @ApiOperation({ summary: 'Endpoint to get all books' })
    async getAllBooks(@Query() query: Pagination){
        return await this.booksService.getAllBooks(query)
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Endpoint to get book by id' })
    async getBookById(@Param() params: ParamsWithIdDto){
        return await this.booksService.getBookById(new Types.ObjectId(params.id))
    }

    @Post('')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to create a new book' })
    async createBook(@Req() auth: Request & { user: TokenData }, @Body() body: CreateBookDto){
        const { user } = auth;
        return await this.booksService.createBook(user, body)
    }

    @Put('/:id')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to update a book' })
    async updateBook(@Param() params: ParamsWithIdDto, @Req() auth: Request & { user: TokenData }, @Body() body: UpdateBookDto){
        const { user } = auth;
        return await this.booksService.updateBook(user, new Types.ObjectId(params.id), body)
    }

    @Delete('/:id')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to delete a book' })
    async deleteBook(@Param() params: ParamsWithIdDto, @Req() auth: Request & { user: TokenData }){
        const { user } = auth;
        return await this.booksService.deleteBook(user, new Types.ObjectId(params.id))
    }

    @Post('/:id/comments')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to comment on a book' })
    async createBookComment(@Param() params: ParamsWithIdDto, @Req() auth: Request & { user: TokenData }, @Body() body: CreateCommentDto){
        const { user } = auth;
        return await this.booksService.commentOnBook(user, new Types.ObjectId(params.id), body)
    }

    @Get('/:id/comments')
    @ApiOperation({ summary: 'Endpoint to get all comments on a book' })
    async getBookComments(@Param() params: ParamsWithIdDto, @Req() auth: Request & { user: TokenData }, @Query() query: Pagination){
        const { user } = auth;
        return await this.booksService.getBookComments(user, new Types.ObjectId(params.id), query)
    }
}