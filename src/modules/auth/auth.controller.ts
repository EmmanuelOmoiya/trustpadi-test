import { Controller, Get, UseGuards, Req, Post, Body, Param, Query, Put, Delete, Patch } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthResponse, BadRequestResponse, LoginDto, RegisterDto, ResetPasswordDTO } from "./dtos";
import { AccessTokenGuard } from "./guards/jwt.guard";
import { RefreshTokenGuard } from "./guards/refreshToken.guard";
import { IResponse, TokenData } from "@//interfaces";

@ApiTags('auth')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('register')
    @ApiOperation({ summary: 'Endpoint to create an account' })
    @ApiCreatedResponse({ type: AuthResponse })
    @ApiBadRequestResponse({ type: BadRequestResponse })
    async register(@Body() body: RegisterDto) {
        return await this.authService.register(body);
    }

    @Post('login')
    @ApiOperation({ summary: 'Endpoint to login to your account' })
    async login(@Body() payload: LoginDto) {
        return await this.authService.login(payload);
    }

    @Post('logout')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to logut from your account' })
    async logout(@Req() auth: Request & { user: TokenData }) {
        const { user } = auth;
        return await this.authService.logout(user as unknown as TokenData);
    }

    @UseGuards(RefreshTokenGuard)
    @Get('refresh')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Endpoint to generate access token using a refresh token' })
    async refreshToken(@Req() req: Request & { user: TokenData }) {
        const payload = req.user as TokenData & { refreshToken: string };
        return await this.authService.refreshTokens(payload);
    }

    @ApiBody({ type: ResetPasswordDTO })
    @Patch('reset-password')
    @ApiOperation({ summary: 'Endpoint to reset password' })
    async resetPassword(@Body() body: ResetPasswordDTO): Promise<IResponse> {
        return await this.authService.resetPassword(body);
    }
}
