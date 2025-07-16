import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { ENV } from 'src/constants';
import { RedisClientOptions } from 'redis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          ttl: 600000,
          isGlobal: true,
          store: redisStore,
          host: configService.get(ENV.REDIS_HOST),
          port: configService.get(ENV.REDIS_PORT),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CachesModule {}
