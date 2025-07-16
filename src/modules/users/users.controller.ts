import { Controller, Get, UseGuards, Req, Post, Body, Param, Query, Put, Delete } from "@nestjs/common";
import { UsersService } from "./users.service";
import { TokenData } from "@//interfaces";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { ParamsWithIdDto } from "../books/dtos/book.dto";
import { Types } from "mongoose";
import { AccessTokenGuard } from "../auth/guards/jwt.guard";

@Controller({ version: '1', path: 'users' })
export class UsersController {
    constructor(private usersService: UsersService){}

    @Post('/:id/follow')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to follow a user' })
    async followUser(@Req() auth: Request & { user: TokenData }, @Param() params: ParamsWithIdDto){
        const { user } = auth;
        return await this.usersService.followUser(new Types.ObjectId(user?.user), new Types.ObjectId(params.id))
    }

    @Delete('/:id/follow')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to unfollow a user' })
    async unfollowUser(@Req() auth: Request & { user: TokenData }, @Param() params: ParamsWithIdDto){
        const { user } = auth;
        return await this.usersService.unfollowUser(new Types.ObjectId(user?.user), new Types.ObjectId(params.id))
    }

    @Get('/:id/followers')
    @ApiOperation({ summary: 'Endpoint to get the list of user\'s followers' })
    async getFollowers(@Param() params: ParamsWithIdDto){
        return await this.usersService.getFollowers(params.id)
    }

    @Get('/:id/following')
    @ApiOperation({ summary: 'Endpoint to get a user\'s following list' })
    async getFollowing(@Param() params: ParamsWithIdDto){
        return await this.usersService.getFollowing(params.id)
    }
}