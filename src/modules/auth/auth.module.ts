import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schema/users.schema";
import { CachesModule } from "../cache/cache.module";
import { AuthService } from "./auth.service";
import EncryptService from "@//helpers/encryption";
import { RefreshTokenStrategy } from "./strategies/refreshToken.strategy";
import { AccessTokenStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        JwtModule.register({}),
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
        CachesModule,
    ],
    providers: [
        AuthService,
        EncryptService,
        RefreshTokenStrategy,
        AccessTokenStrategy
    ],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule {}
