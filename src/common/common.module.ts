import { Global, Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV, NODE_ENV } from '@//constants';

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    uri: configService.get(
                        process.env.NODE_ENV === NODE_ENV.PROD ? ENV.MONGODB_URI : process.env.NODE_ENV === NODE_ENV.STAGGING ? ENV.MONGODB_URI : ENV.MONGODB_URI
                    )
                }
            }
        })
    ]
})
export class CommonModule {}