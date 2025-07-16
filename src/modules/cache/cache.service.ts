import { Inject, Injectable } from '@nestjs/common';
import { RegisterCacheDto } from './dto/cache.dto';
import { GenericMatch } from '../../interfaces';
import { ICache } from './interface/cache.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService implements ICache {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: any) {}

  async save(payload: RegisterCacheDto): Promise<any> {
    const { data, ttl, key } = payload;
    console.log(payload, 'new data saved');
    return await this.cacheManager.set(key, data, ttl);
  }

  async get(key: string): Promise<GenericMatch> {
    return await this.cacheManager.get(key);
  }

  async delete(key: string): Promise<void> {
    const data = await this.get(key);
    if (!data) {
      return;
    }
    return await this.cacheManager.del(key);
  }

  async update(key: string, update: RegisterCacheDto): Promise<void> {
    const data = await this.get(key);
    if (data) {
      await this.delete(key);
    }
    await this.save(update);
  }
}
